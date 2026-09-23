export function RoleNotice() {
  return (
    <aside className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
      <span className="w-1 shrink-0 bg-navy-900" aria-hidden="true" />
      <div className="px-4 py-3.5 sm:px-5">
        <p className="text-sm font-semibold text-slate-800">역할 안내</p>
        <p className="mt-1.5 text-sm leading-6 text-slate-600">
          이 시스템은 학생의 학적 상태나 행정 처리를 자동으로 결정하지 않습니다.
          정해진 업무 규칙과 데이터에 따라 확인 대상을 분류하고, 생성형 AI는
          담당자가 사용할 안내문이나 확인 요청 문구를 작성하는 역할만 합니다.
        </p>
      </div>
    </aside>
  );
}
