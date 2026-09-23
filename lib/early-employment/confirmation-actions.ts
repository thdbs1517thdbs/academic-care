"use server";

import { GoogleGenAI } from "@google/genai";
import { groupNeedsReviewByOpeningDepartment } from "@/lib/early-employment/confirmation-request";
import { teamName, universityName } from "@/lib/site";
import { getEarlyEmploymentRecords } from "@/lib/supabase/reads";

const geminiModel = "gemini-3.5-flash-lite";

export type ConfirmationDraftResult =
  | { ok: true; text: string }
  | { ok: false; message: string };

const failureMessage = "AI 문안 생성에 실패했습니다. 다시 시도해주세요.";
const maxGenerateAttempts = 4;
const retryBackoffMs = [1000, 2000, 4000];
const retryableHttpStatuses = new Set([500, 502, 503, 504]);
const retryableApiStatuses = new Set([
  "INTERNAL",
  "UNAVAILABLE",
  "DEADLINE_EXCEEDED",
]);

export async function draftOpeningDepartmentConfirmation(
  openingDepartment: string,
): Promise<ConfirmationDraftResult> {
  const department = parseDepartment(openingDepartment);
  if (!department) {
    return { ok: false, message: failureMessage };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, message: failureMessage };
  }

  try {
    const records = await getEarlyEmploymentRecords();
    const group = groupNeedsReviewByOpeningDepartment(records).find(
      (item) => item.openingDepartment === department,
    );

    if (!group || group.courseCount < 1) {
      return { ok: false, message: failureMessage };
    }

    const facts = group.records.map((record) => ({
      courseName: record.courseName,
      studentName: record.studentName,
      homeDepartment: record.homeDepartment,
      studentId: record.studentId,
    }));

    const ai = new GoogleGenAI({ apiKey });
    return await generateDraftWithRetry(
      ai,
      buildPrompt(department, group.courseCount, facts),
      department,
    );
  } catch (error) {
    console.error("[confirmation-draft] generation failed", {
      attempt: 1,
      errorType: "exception",
      status: readHttpStatus(error),
    });
    return { ok: false, message: failureMessage };
  }
}

async function generateDraftWithRetry(
  ai: GoogleGenAI,
  contents: string,
  department: string,
) {
  for (let attempt = 1; attempt <= maxGenerateAttempts; attempt += 1) {
    if (attempt > 1) {
      await delay(retryBackoffMs[attempt - 2] + randomJitterMs());
    }

    try {
      const response = await ai.models.generateContent({
        model: geminiModel,
        contents,
        config: {
          temperature: 0.2,
        },
      });
      const text = response.text?.trim() ?? "";
      const validation = validateDraftText(text, department);

      if (!validation.ok) {
        console.error("[confirmation-draft] validation failed", {
          attempt,
          errorType: validation.reason,
        });
        return { ok: false as const, message: failureMessage };
      }

      return { ok: true as const, text };
    } catch (error) {
      const status = readHttpStatus(error);
      const transient = isRetryableTransient(error);
      console.error("[confirmation-draft] generation failed", {
        attempt,
        errorType: transient ? "transient" : "exception",
        status,
      });

      if (!transient || attempt === maxGenerateAttempts) {
        return { ok: false as const, message: failureMessage };
      }
    }
  }

  return { ok: false as const, message: failureMessage };
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function randomJitterMs() {
  return Math.floor(Math.random() * 250);
}

function readHttpStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return null;
}

function isRetryableTransient(error: unknown) {
  const status = readHttpStatus(error);
  if (status !== null) {
    return retryableHttpStatuses.has(status);
  }

  const apiStatus = readGoogleApiStatus(error);
  return apiStatus !== null && retryableApiStatuses.has(apiStatus);
}

function readGoogleApiStatus(error: unknown) {
  if (!(error instanceof Error) || !error.message) {
    return null;
  }

  try {
    const parsed = JSON.parse(error.message) as {
      error?: { status?: unknown };
    };
    return typeof parsed.error?.status === "string" ? parsed.error.status : null;
  } catch {
    return null;
  }
}

function parseDepartment(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const department = value.trim();
  if (department.length < 2 || department.length > 40) {
    return null;
  }

  return department;
}

function validateDraftText(text: string, department: string) {
  if (!text) {
    return { ok: false as const, reason: "empty" as const };
  }

  if (text.length > 4000) {
    return { ok: false as const, reason: "too_long" as const };
  }

  if (!text.includes(department)) {
    return { ok: false as const, reason: "missing_department" as const };
  }

  return { ok: true as const };
}

function buildPrompt(
  openingDepartment: string,
  courseCount: number,
  records: {
    courseName: string;
    studentName: string;
    homeDepartment: string;
    studentId: string;
  }[],
) {
  const lines = records.map(
    (record) =>
      `- 과목명: ${record.courseName} / 학생명: ${record.studentName} / 소속학과: ${record.homeDepartment} / 학번: ${record.studentId}`,
  );

  return [
    "다음 데이터는 시스템 규칙에 의해 이미 확인 대상으로 확정된 데이터입니다.",
    "대상 여부를 판단하거나 건수를 다시 계산하지 말고,",
    "제공된 사실만 사용하여 문안을 작성하세요.",
    "제공된 확인 필요 건수, 과목명, 학생명, 소속학과, 학번을 임의로 바꾸거나 누락하지 마세요.",
    "제공되지 않은 사실을 추측하거나 추가하지 마세요.",
    "새로운 사유, 일정, 규정, 제출기한, 담당자 연락처를 만들지 마세요.",
    "이메일, 생년월일, 국적, 미복학 정보, 담당자 메모는 제공되지 않았으므로 만들지 마세요.",
    `발신 주체는 ${universityName} ${teamName}입니다. 담당자 개인 이름은 만들지 마세요.`,
    "대학 학사운영팀 담당자가 학과 담당자에게 이메일이나 업무메시지로 보내는 것처럼 간결하고 자연스럽게 쓰세요.",
    "지나치게 격식적이거나 장황한 공문체는 피하세요.",
    "AI 특유의 설명조나 같은 말의 반복을 피하세요.",
    '"확인을 요청드립니다", "대상 내역은 다음과 같습니다"처럼 불필요하게 딱딱한 표현을 반복하지 마세요.',
    '"미제출입니다"라고 단정하지 말고, "제출이 확인되지 않은"처럼 행정적으로 자연스럽게 쓰세요.',
    `첫 문장은 "안녕하세요. ${universityName} ${teamName}입니다."로 시작하세요.`,
    `"귀 학과"처럼 학과를 모호하게 쓰지 마세요.`,
    `본문에 개설학과명 "${openingDepartment}"를 정확한 문자열 그대로 최소 1회 포함하세요.`,
    `확인 필요 건수 ${courseCount}건은 이미 확정된 숫자입니다. 다시 세지 말고, 본문에 자연스럽게 포함하세요.`,
    "각 대상은 한 줄에 '[과목명] 학생명 / 소속학과 / 학번' 형식으로 모두 포함하세요.",
    `끝은 "감사합니다."와 "${universityName} ${teamName} 드림"으로 간단히 마무리하세요.`,
    "아래 예시는 문체 참고용입니다. 예시의 학과, 건수, 과목, 학생, 학번을 그대로 출력하지 말고, 제공된 사실로 새로 작성하세요.",
    "문안만 출력하고, 설명이나 코드 블록은 붙이지 마세요.",
    "",
    "문체 예시:",
    `안녕하세요. ${universityName} ${teamName}입니다.`,
    "",
    "조기취업 공결 신청 후 4주가 경과하였으나, 영어영문학과 개설 수업 중 수업계획서 제출이 확인되지 않은 과목이 총 2건 있습니다.",
    "아래 과목의 수업계획서 제출 여부를 확인하여 주시기 바랍니다.",
    "",
    "[영미문화] 오채원 / 영어영문학과 / 20231031",
    "[영어학개론] 오채원 / 영어영문학과 / 20231031",
    "",
    "감사합니다.",
    `${universityName} ${teamName} 드림`,
    "",
    "작성에 사용할 사실:",
    `개설학과: ${openingDepartment}`,
    `확인 필요 건수: ${courseCount}`,
    "이미 확정된 사실: 조기취업 공결 신청 후 4주가 경과하였고, 아래 과목의 수업계획서 제출은 확인되지 않았습니다.",
    "대상:",
    ...lines,
  ].join("\n");
}
