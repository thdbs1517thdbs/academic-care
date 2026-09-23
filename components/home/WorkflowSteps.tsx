const steps = [
  "대상 확인",
  "확인 필요 자동 분류",
  "담당자 후속 확인",
  "AI 안내문 작성 / 담당자 메모",
  "처리 완료",
];

export function WorkflowSteps() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">업무 흐름</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        확인 대상을 가려 내고, 담당자가 후속 조치한 뒤 처리 완료까지 이어지는
        순서입니다.
      </p>
      <ol className="mt-5 flex flex-col lg:flex-row lg:items-start">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          return (
            <li key={step} className="flex min-w-0 flex-1 gap-3 lg:flex-col">
              <div className="flex flex-col items-center self-stretch lg:h-7 lg:w-full lg:flex-row lg:self-auto">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                {!last && (
                  <span className="mt-1 w-px flex-1 bg-slate-200 lg:mt-0 lg:ml-3 lg:h-px lg:w-auto lg:min-w-3" />
                )}
              </div>
              <p className="pb-6 text-sm font-medium leading-5 text-slate-800 lg:mt-3 lg:pr-5 lg:pb-0">
                {step}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
