import {
  summarizeNonReturning,
  isForeignStudent,
} from "@/lib/non-returning/summary";
import type {
  AcademicStatus,
  ApplicationStatus,
  Department,
  ManagementStatus,
  NonReturningStudent,
} from "@/lib/non-returning/types";
import { departments, foreignNationalities } from "@/lib/non-returning/types";

type Seed = {
  studentName: string;
  department: Department;
  studentId: string;
  nationality: string;
  applicationStatus: ApplicationStatus;
  academicStatus?: AcademicStatus;
  managementStatus: ManagementStatus;
  staffMemo?: string;
  leaveExpiresOn: string;
};

const seeds: Seed[] = [
  { studentName: "서하준", department: "국어국문학과", studentId: "202301723", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-31" },
  { studentName: "문성훈", department: "철학과", studentId: "202001834", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", staffMemo: "이메일 재안내 필요.", leaveExpiresOn: "2026-08-15" },
  { studentName: "노은채", department: "행정학과", studentId: "202101945", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-31" },
  { studentName: "임재원", department: "사회복지학과", studentId: "202202056", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-31" },
  { studentName: "조민서", department: "미디어커뮤니케이션학과", studentId: "202302167", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-07-31" },
  { studentName: "백승우", department: "컴퓨터공학과", studentId: "202002278", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-31" },
  { studentName: "유다인", department: "전자공학과", studentId: "202102389", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", staffMemo: "이메일 재안내 필요.", leaveExpiresOn: "2026-08-15" },
  { studentName: "남궁현", department: "AI빅데이터학과", studentId: "202202490", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-15" },
  { studentName: "차예준", department: "보건행정학과", studentId: "202302501", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-31" },
  { studentName: "구본우", department: "임상병리학과", studentId: "202002612", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-07-31" },
  { studentName: "피지연", department: "물리치료학과", studentId: "202102723", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-15" },
  { studentName: "마서영", department: "경영학과", studentId: "202202834", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-31" },
  { studentName: "방준혁", department: "국어국문학과", studentId: "202302945", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-07-31" },
  { studentName: "도윤아", department: "행정학과", studentId: "202003056", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-31" },
  { studentName: "팜 민 투안", department: "컴퓨터공학과", studentId: "202103167", nationality: "베트남", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-15" },
  { studentName: "사토 유키", department: "국어국문학과", studentId: "202203278", nationality: "일본", applicationStatus: "미신청", managementStatus: "확인 필요", staffMemo: "이메일 재안내 필요.", leaveExpiresOn: "2026-08-31" },
  { studentName: "바트볼드", department: "사회복지학과", studentId: "202303389", nationality: "몽골", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-07-31" },
  { studentName: "싱 아르준", department: "AI빅데이터학과", studentId: "202003490", nationality: "인도", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-31" },
  { studentName: "천메이링", department: "임상병리학과", studentId: "202103501", nationality: "대만", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-15" },
  { studentName: "라이 수잔", department: "보건행정학과", studentId: "202203612", nationality: "네팔", applicationStatus: "미신청", managementStatus: "확인 필요", leaveExpiresOn: "2026-08-15" },
  { studentName: "최유진", department: "영어영문학과", studentId: "202000612", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "연락 완료", staffMemo: "이메일 안내 완료. 학생 회신 대기 중.", leaveExpiresOn: "2026-08-31" },
  { studentName: "정민재", department: "철학과", studentId: "202100723", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "연락 완료", staffMemo: "학생 회신 확인. 9/24 중 연속휴학 신청 예정.", leaveExpiresOn: "2026-08-15" },
  { studentName: "한소율", department: "행정학과", studentId: "202200834", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "연락 완료", staffMemo: "이메일 안내 완료. 학생 회신 대기 중.", leaveExpiresOn: "2026-07-31" },
  { studentName: "오세훈", department: "사회복지학과", studentId: "202300945", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "연락 완료", staffMemo: "이메일 재안내 필요.", leaveExpiresOn: "2026-08-31" },
  { studentName: "윤지호", department: "회계학과", studentId: "202001056", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "연락 완료", staffMemo: "이메일 안내 완료. 학생 회신 대기 중.", leaveExpiresOn: "2026-07-31" },
  { studentName: "배수지", department: "물리치료학과", studentId: "202101167", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "연락 완료", staffMemo: "학생 회신 확인. 9/24 중 연속휴학 신청 예정.", leaveExpiresOn: "2026-08-15" },
  { studentName: "장예린", department: "호텔관광학과", studentId: "202201278", nationality: "대한민국", applicationStatus: "미신청", managementStatus: "연락 완료", staffMemo: "이메일 안내 완료. 학생 회신 대기 중.", leaveExpiresOn: "2026-08-31" },
  { studentName: "쩐 티 화", department: "호텔관광학과", studentId: "202301389", nationality: "베트남", applicationStatus: "미신청", managementStatus: "연락 완료", staffMemo: "국제교류지원팀 관리 예정.", leaveExpiresOn: "2026-08-31" },
  { studentName: "리샤오밍", department: "회계학과", studentId: "202001490", nationality: "중국", applicationStatus: "미신청", managementStatus: "연락 완료", staffMemo: "이메일 안내 완료. 학생 회신 대기 중.", leaveExpiresOn: "2026-08-15" },
  { studentName: "타나카 하루", department: "미디어커뮤니케이션학과", studentId: "202101501", nationality: "일본", applicationStatus: "미신청", managementStatus: "연락 완료", staffMemo: "국제교류지원팀 관리 예정.", leaveExpiresOn: "2026-07-31" },
  { studentName: "린자웨이", department: "영어영문학과", studentId: "202201612", nationality: "대만", applicationStatus: "미신청", managementStatus: "연락 완료", staffMemo: "이메일 재안내 필요.", leaveExpiresOn: "2026-08-31" },
  { studentName: "김도윤", department: "국어국문학과", studentId: "202000101", nationality: "대한민국", applicationStatus: "신청", academicStatus: "재학", managementStatus: "처리 완료", staffMemo: "복학 신청 확인.", leaveExpiresOn: "2026-08-31" },
  { studentName: "박서준", department: "경영학과", studentId: "202100214", nationality: "대한민국", applicationStatus: "신청", academicStatus: "재학", managementStatus: "처리 완료", staffMemo: "복학 신청서 접수 확인.", leaveExpiresOn: "2026-08-15" },
  { studentName: "이하늘", department: "컴퓨터공학과", studentId: "202200318", nationality: "대한민국", applicationStatus: "신청", academicStatus: "재학", managementStatus: "처리 완료", staffMemo: "복학 신청 확인.", leaveExpiresOn: "2026-07-31" },
  { studentName: "응우옌 민 안", department: "전자공학과", studentId: "202300427", nationality: "베트남", applicationStatus: "신청", academicStatus: "휴학", managementStatus: "처리 완료", staffMemo: "연속휴학 신청 확인.", leaveExpiresOn: "2026-08-31" },
  { studentName: "왕리웨이", department: "경영학과", studentId: "202100508", nationality: "중국", applicationStatus: "신청", academicStatus: "휴학", managementStatus: "처리 완료", staffMemo: "연속휴학 신청 확인. 국제교류지원팀 공유.", leaveExpiresOn: "2026-08-15" },
];

export const nonReturningStudents: NonReturningStudent[] = seeds.map(
  (seed, index) => ({
    id: seed.studentId,
    studentName: seed.studentName,
    department: seed.department,
    studentId: seed.studentId,
    email:
      index % 2 === 0
        ? `student${seed.studentId}@gmail.com`
        : `${seed.studentId}@hankuk-univ.example`,
    nationality: seed.nationality,
    returnSemester: "2026-2학기",
    leaveExpiresOn: seed.leaveExpiresOn,
    applicationStatus: seed.applicationStatus,
    academicStatus: seed.academicStatus ?? "휴학",
    managementStatus: seed.managementStatus,
    resolutionType: null,
    staffMemo: seed.staffMemo ?? "",
  }),
);

function assertSeed(students: NonReturningStudent[]) {
  const summary = summarizeNonReturning(students);
  const departmentCount = new Set(students.map((student) => student.department)).size;
  const ids = new Set(students.map((student) => student.studentId));
  const appliedWithoutCompletion = students.some(
    (student) =>
      (student.applicationStatus === "신청") !==
      (student.managementStatus === "처리 완료"),
  );
  const invalidEmail = students.some(
    (student) =>
      !student.email.endsWith("@gmail.com") &&
      !student.email.endsWith("@hankuk-univ.example"),
  );
  const allowedLeaveDates = ["2026-07-31", "2026-08-15", "2026-08-31"];
  const invalidLeaveDate = students.some(
    (student) => !allowedLeaveDates.includes(student.leaveExpiresOn),
  );
  const invalidNationality = students.some(
    (student) =>
      isForeignStudent(student) &&
      !foreignNationalities.includes(
        student.nationality as (typeof foreignNationalities)[number],
      ),
  );

  if (
    summary.targetCount !== 36 ||
    summary.foreignCount !== 12 ||
    summary.unconfirmedCount !== 31 ||
    summary.confirmedCount !== 5 ||
    departmentCount !== departments.length ||
    ids.size !== students.length ||
    appliedWithoutCompletion ||
    invalidEmail ||
    invalidLeaveDate ||
    invalidNationality
  ) {
    throw new Error("미복학 임시 데이터 집계가 기준과 다릅니다.");
  }
}

assertSeed(nonReturningStudents);
