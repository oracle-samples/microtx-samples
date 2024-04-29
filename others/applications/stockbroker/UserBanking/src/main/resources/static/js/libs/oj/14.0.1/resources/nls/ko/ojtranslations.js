define({"oj-message":{fatal:"치명적",error:"오류",warning:"경고",info:"정보",confirmation:"확인","compact-type-summary":"{0}: {1}"},"oj-converter":{summary:"값이 예상된 형식이 아닙니다.",detail:"예상된 형식으로 값을 입력하십시오.","plural-separator":", ",hint:{summary:"예: {exampleValue}",detail:"다음 형식으로 값을 입력하십시오. 예: '{exampleValue}'.","detail-plural":"다음 형식으로 값을 입력하십시오. 예: '{exampleValue}'."},optionHint:{detail:"'{propertyName}' 옵션에 허용되는 값은 '{propertyValueValid}'입니다.","detail-plural":"'{propertyName}' 옵션에 허용되는 값은 '{propertyValueValid}'입니다."},optionTypesMismatch:{summary:"'{propertyName}' 옵션이 '{propertyValue}'(으)로 설정되었으면 '{requiredPropertyName}' 옵션에 대한 값이 필수입니다."},optionTypeInvalid:{summary:"'{propertyName}' 옵션에 대해 예상된 유형의 값이 제공되지 않았습니다."},optionOutOfRange:{summary:"'{propertyName}' 옵션에 대한 {propertyValue} 값이 범위를 벗어납니다."},optionValueInvalid:{summary:"'{propertyName}' 옵션에 대해 부적합한 값 '{propertyValue}'이(가) 지정되었습니다."},number:{decimalFormatMismatch:{summary:"제공된 값은 예상된 숫자 형식이 아닙니다."},shortLongUnsupportedParse:{summary:"'short' 및 'long'은 변환기 구문분석에 대해 지원되지 않습니다.",detail:"구성요소를 readonly로 변경합니다. readonly 필드는 변환기의 구문분석 함수를 호출하지 않습니다."},currencyFormatMismatch:{summary:"제공된 값은 예상된 통화 형식이 아닙니다."},percentFormatMismatch:{summary:"제공된 값은 예상된 퍼센트 형식이 아닙니다."},invalidNumberFormat:{summary:"제공된 값은 적합한 숫자가 아닙니다.",detail:"적합한 숫자를 제공하십시오."}},color:{invalidFormat:{summary:"부적합한 색상 형식입니다.",detail:"부적합한 색상 형식 옵션 지정입니다."},invalidSyntax:{summary:"부적합한 색상 지정입니다.",detail:"CSS3 표준을 준수하는 색상 값을 입력하십시오."}},datetime:{datetimeOutOfRange:{summary:"'{value}' 값이 '{propertyName}'의 범위를 벗어납니다.",detail:"'{minValue}'~'{maxValue}' 사이의 값을 입력하십시오.",hour:"시간",minute:"분",second:"초",millisec:"밀리초",month:"월",day:"일",year:"년","month name":"월 이름",weekday:"요일"},dateFormatMismatch:{summary:"제공된 값은 예상된 날짜 형식이 아닙니다."},invalidTimeZoneID:{summary:"부적합한 시간대 ID {timeZoneID}이(가) 제공되었습니다."},nonExistingTime:{summary:"일광 절약 시간제로 전환하는 중 시간이 단축되어 해당 입력 시간이 존재하지 않습니다."},missingTimeZoneData:{summary:"시간대 데이터가 누락되었습니다. 시간대 데이터를 로드하려면 'ojs/ojtimezonedata'의 호출이 필요합니다."},timeFormatMismatch:{summary:"제공된 값은 예상된 시간 형식이 아닙니다."},datetimeFormatMismatch:{summary:"제공된 값은 예상된 날짜 및 시간 형식이 아닙니다."},dateToWeekdayMismatch:{summary:"일자 '{date}'이(가) '{weekday}'에 포함되지 않습니다.",detail:"날짜와 일치하는 요일을 입력하십시오."},invalidISOString:{invalidRangeSummary:"'{value}' 값이 ISO 8601 문자열 '{isoStr}'의 '{propertyName}' 필드 범위를 벗어납니다.",summary:"제공된 '{isoStr}'은(는) 부적합한 ISO 8601 문자열입니다.",detail:"적합한 ISO 8601 문자열을 제공하십시오."}}},"oj-validator":{length:{hint:{min:"{min}자 이상을 입력하십시오.",max:"{max}자 이하를 입력하십시오.",inRange:"{min}~{max}자를 입력하십시오.",exact:"{length}자를 입력하십시오."},messageDetail:{tooShort:"{min}자 이상을 입력하십시오.",tooLong:"{max}자 이하를 입력하십시오."},messageSummary:{tooShort:"문자 수가 너무 적습니다.",tooLong:"문자 수가 너무 많습니다."}},range:{number:{hint:{min:"{min}보다 크거나 같은 숫자를 입력하십시오.",max:"{max}보다 작거나 같은 숫자를 입력하십시오.",inRange:"{min}~{max} 사이의 숫자를 입력하십시오.",exact:"숫자 {num}을(를) 입력하십시오."},messageDetail:{rangeUnderflow:"{min} 이상의 숫자를 입력하십시오.",rangeOverflow:"{max} 이하의 숫자를 입력하십시오.",exact:"숫자 {num}을(를) 입력하십시오."},messageSummary:{rangeUnderflow:"숫자가 너무 낮습니다.",rangeOverflow:"숫자가 너무 높습니다."}},datetime:{hint:{min:"{min} 또는 이후의 날짜 및 시간을 입력하십시오.",max:"{max} 또는 이전의 날짜 및 시간을 입력하십시오.",inRange:"{min}~{max} 사이의 날짜 및 시간을 입력하십시오."},messageDetail:{rangeUnderflow:"{min} 또는 이후 날짜를 입력하십시오.",rangeOverflow:"{max} 또는 이전 날짜를 입력하십시오."},messageSummary:{rangeUnderflow:"날짜 및 시간이 최소 날짜 및 시간보다 이전입니다.",rangeOverflow:"날짜 및 시간이 최대 날짜 및 시간보다 이후입니다."}},date:{hint:{min:"{min} 또는 이후 날짜를 입력하십시오.",max:"{max} 또는 이전 날짜를 입력하십시오.",inRange:"{min}에서 {max} 사이의 날짜를 입력하십시오."},messageDetail:{rangeUnderflow:"{min} 또는 이후 날짜를 입력하십시오.",rangeOverflow:"{max} 또는 이전 날짜를 입력하십시오."},messageSummary:{rangeUnderflow:"날짜가 최소 날짜보다 이전입니다.",rangeOverflow:"날짜가 최대 날짜보다 이후입니다."}},time:{hint:{min:"{min} 또는 이후 시간을 입력하십시오.",max:"{max} 또는 이전 시간을 입력하십시오.",inRange:"{min}에서 {max} 사이의 시간을 입력하십시오."},messageDetail:{rangeUnderflow:"{min} 또는 이후 시간을 입력하십시오.",rangeOverflow:"{max} 또는 이전 시간을 입력하십시오."},messageSummary:{rangeUnderflow:"시간이 최소 시간보다 이전입니다.",rangeOverflow:"시간이 최대 시간보다 이후입니다."}}},restriction:{date:{messageSummary:"날짜 {value}은(는) 사용 안함으로 설정된 항목입니다.",messageDetail:"선택한 날짜를 사용할 수 없습니다. 다른 날짜를 시도하십시오."}},regExp:{summary:"형식이 잘못되었습니다.",detail:"다음 정규 표현식에 설명된 허용 가능한 값을 입력하십시오. '{pattern}'."},required:{summary:"값이 필요합니다.",detail:"값을 입력하십시오."}},"oj-ojEditableValue":{loading:"로드 중",requiredText:"필수",helpSourceText:"자세히..."},"oj-ojInputDate":{done:"완료",cancel:"취소",time:"시간",prevText:"이전",nextText:"다음",currentText:"오늘",weekHeader:"주",tooltipCalendar:"날짜 선택.",tooltipCalendarTime:"날짜/시간 선택.",tooltipCalendarDisabled:"사용 안함으로 설정된 날짜 선택.",tooltipCalendarTimeDisabled:"사용 안함으로 설정된 날짜/시간 선택.",picker:"선택기",weekText:"주",datePicker:"날짜 선택기",inputHelp:"달력에 액세스하려면 아래로 키 또는 위로 키를 누르십시오.",inputHelpBoth:"달력에 액세스하려면 아래로 키 또는 위로 키를 누르고 시간 드롭다운에 액세스하려면 Shift + 아래로 키 또는 Shift + 위로 키를 누르십시오.",dateTimeRange:{hint:{min:"",max:"",inRange:""},messageDetail:{rangeUnderflow:"",rangeOverflow:""},messageSummary:{rangeUnderflow:"",rangeOverflow:""}},dateRestriction:{hint:"",messageSummary:"",messageDetail:""}},"oj-ojInputTime":{cancelText:"취소",okText:"확인",currentTimeText:"지금",hourWheelLabel:"시간",minuteWheelLabel:"분",ampmWheelLabel:"AMPM",tooltipTime:"시간 선택.",tooltipTimeDisabled:"사용 안함으로 설정된 시간 선택.",inputHelp:"시간 드롭다운에 액세스하려면 아래로 키 또는 위로 키를 누르십시오.",dateTimeRange:{hint:{min:"",max:"",inRange:""},messageDetail:{rangeUnderflow:"",rangeOverflow:""},messageSummary:{rangeUnderflow:"",rangeOverflow:""}}},"oj-inputBase":{required:{hint:"",messageSummary:"",messageDetail:""},regexp:{messageSummary:"",messageDetail:""},accessibleMaxLengthExceeded:"최대 길이 {len} 초과.",accessibleMaxLengthRemaining:"{chars}자 남음."},"oj-ojInputText":{accessibleClearIcon:"지우기"},"oj-ojInputPassword":{regexp:{messageDetail:"값은 다음 패턴과 일치해야 함: '{pattern}'."},accessibleShowPassword:"비밀번호 표시.",accessibleHidePassword:"비밀번호 숨기기."},"oj-ojFilmStrip":{labelAccFilmStrip:"{pageIndex}/{pageCount} 페이지 표시 중",labelAccArrowNextPage:"$[다음$]을 선택하여 다음 페이지 표시",labelAccArrowPreviousPage:"$[이전$]을 선택하여 이전 페이지 표시",tipArrowNextPage:"다음",tipArrowPreviousPage:"이전"},"oj-ojDataGrid":{accessibleSortAscending:"{id}이(가) 오름차순으로 정렬됨",accessibleSortDescending:"{id} 내림차순으로 정렬",accessibleSortable:"{id} 정렬 가능",accessibleActionableMode:"작업 가능 모드로 들어감.",accessibleNavigationMode:"탐색 모드로 들어가 F2를 눌러 편집 또는 작업 가능 모드로 들어갑니다.",accessibleEditableMode:"편집 가능 모드로 들어가 Esc를 눌러 데이터 그리드 밖으로 이동합니다.",accessibleSummaryExact:"{rownum} 행 및 {colnum} 열이 포함된 데이터 그리드입니다.",accessibleSummaryEstimate:"알 수 없는 행 및 열 수를 포함하는 데이터 그리드입니다.",accessibleSummaryExpanded:"현재 {num}개 행이 확장되었습니다.",accessibleRowExpanded:"행 확장",accessibleExpanded:"확장됨",accessibleRowCollapsed:"행 축소",accessibleCollapsed:"축소됨",accessibleRowSelected:"선택한 행 {row}",accessibleColumnSelected:"선택한 열 {column}",accessibleStateSelected:"선택됨",accessibleMultiCellSelected:"{num}개 셀 선택됨",accessibleColumnSpanContext:"{extent} 너비",accessibleRowSpanContext:"{extent} 높이",accessibleRowContext:"행 {index}",accessibleColumnContext:"열 {index}",accessibleRowHeaderContext:"행 머리글 {index}",accessibleColumnHeaderContext:"열 머리글 {index}",accessibleRowEndHeaderContext:"행 끝 머리글 {index}",accessibleColumnEndHeaderContext:"열 끝 머리글 {index}",accessibleRowHeaderLabelContext:"행 머리글 레이블 {level}",accessibleColumnHeaderLabelContext:"열 머리글 레이블 {level}",accessibleRowEndHeaderLabelContext:"행 끝 머리글 레이블 {level}",accessibleColumnEndHeaderLabelContext:"열 끝 머리글 레이블 {level}",accessibleLevelContext:"레벨 {level}",accessibleRangeSelectModeOn:"선택한 범위의 셀 추가 모드 설정.",accessibleRangeSelectModeOff:"선택한 범위의 셀 추가 모드 해제.",accessibleFirstRow:"첫번째 행에 도달했습니다.",accessibleLastRow:"마지막 행에 도달했습니다.",accessibleFirstColumn:"첫번째 열에 도달했습니다.",accessibleLastColumn:"마지막 열에 도달했습니다.",accessibleSelectionAffordanceTop:"위쪽 선택 핸들.",accessibleSelectionAffordanceBottom:"아래쪽 선택 핸들.",accessibleLevelHierarchicalContext:"레벨 {level}",accessibleRowHierarchicalFull:"{setSize}개 행 중 {posInSet} 행",accessibleRowHierarchicalPartial:"최소 {setSize}개 행 중 {posInSet} 행",accessibleRowHierarchicalUnknown:"최소 {setSize}개 행 중 최소 {posInSet} 행",accessibleColumnHierarchicalFull:"{setSize}개 열 중 {posInSet} 열",accessibleColumnHierarchicalPartial:"최소 {setSize}개 열 중 {posInSet} 열",accessibleColumnHierarchicalUnknown:"최소 {setSize}개 열 중 최소 {posInSet} 열",msgFetchingData:"데이터 인출 중...",msgNoData:"표시할 항목이 없습니다.",labelResize:"크기 조정",labelResizeWidth:"너비 크기 조정",labelResizeHeight:"높이 크기 조정",labelSortAsc:"오름차순 정렬",labelSortDsc:"내림차순 정렬",labelSortRow:"행 정렬",labelSortRowAsc:"행 정렬 오름차순",labelSortRowDsc:"행 정렬 내림차순",labelSortCol:"정렬 열",labelSortColAsc:"열 정렬 오름차순",labelSortColDsc:"열 정렬 내림차순",labelCut:"잘라내기",labelPaste:"붙여넣기",labelCutCells:"잘라내기",labelPasteCells:"붙여넣기",labelCopyCells:"복사",labelAutoFill:"자동 채우기",labelEnableNonContiguous:"비연속 선택 사용",labelDisableNonContiguous:"비연속 선택 사용 안함",labelResizeDialogSubmit:"확인",labelResizeDialogCancel:"취소",accessibleContainsControls:"콘트롤 포함",labelSelectMultiple:"여러 개 선택",labelResizeDialogApply:"적용",labelResizeFitToContent:"전체 크기에 맞게 조정",columnWidth:"너비(픽셀)",rowHeight:"높이(픽셀)",labelResizeColumn:"열 크기 조정",labelResizeRow:"행 크기 조정",resizeColumnDialog:"열 크기 조정",resizeRowDialog:"행 크기 조정",collapsedText:"축소",expandedText:"확대",tooltipRequired:"필수"},"oj-ojRowExpander":{accessibleLevelDescription:"레벨 {level}",accessibleRowDescription:"레벨 {level}, 행 {num}/{total}",accessibleRowExpanded:"행 확장",accessibleRowCollapsed:"행 축소",accessibleStateExpanded:"확장됨",accessibleStateCollapsed:"축소됨"},"oj-ojStreamList":{msgFetchingData:"데이터 인출 중..."},"oj-ojListView":{msgFetchingData:"데이터 인출 중...",msgNoData:"표시할 항목이 없습니다.",msgItemsAppended:"{count}개 항목이 끝에 추가됩니다.",msgFetchCompleted:"모든 항목이 인출됩니다.",indexerCharacters:"A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z",accessibleReorderTouchInstructionText:"길게 두 번 누릅니다.  소리가 날 때까지 기다렸다가 끌어서 재정렬합니다.",accessibleReorderBeforeItem:"이전 {item}",accessibleReorderAfterItem:"이후 {item}",accessibleReorderInsideItem:"대상 {item}",accessibleNavigateSkipItems:"{numSkip}개 항목을 건너 뛰는 중",labelCut:"잘라내기",labelCopy:"복사",labelPaste:"붙여넣기",labelPasteBefore:"앞에 붙여넣기",labelPasteAfter:"뒤에 붙여넣기"},"oj-ojWaterfallLayout":{msgFetchingData:"데이터 인출 중..."},"oj-_ojLabel":{tooltipHelp:"도움말",tooltipRequired:"필수"},"oj-ojLabel":{tooltipHelp:"도움말",tooltipRequired:"필수"},"oj-ojInputNumber":{required:{hint:"",messageSummary:"",messageDetail:""},numberRange:{hint:{min:"",max:"",inRange:"",exact:""},messageDetail:{rangeUnderflow:"",rangeOverflow:"",exact:""},messageSummary:{rangeUnderflow:"",rangeOverflow:""}},tooltipDecrement:"감소",tooltipIncrement:"증가"},"oj-ojTable":{accessibleAddRow:"새 행을 추가하려면 데이터를 입력합니다.",accessibleColumnContext:"열 {index}",accessibleColumnFooterContext:"열 바닥글 {index}",accessibleColumnHeaderContext:"열 헤더 {index}",accessibleContainsControls:"콘트롤 포함",accessibleColumnsSpan:"{count}개 열 확장",accessibleRowContext:"행 {index}",accessibleSortable:"{id} 정렬 가능",accessibleSortAscending:"{id}이(가) 오름차순으로 정렬됨",accessibleSortDescending:"{id} 내림차순으로 정렬",accessibleStateSelected:"선택됨",accessibleStateUnselected:"선택 취소됨",accessibleSummaryEstimate:"{colnum}개 열 및 {rownum}개 이상 행이 있는 테이블입니다.",accessibleSummaryExact:"{colnum}개 열 및 {rownum}개 행이 있는 테이블입니다.",labelAccSelectionAffordanceTop:"위쪽 선택 핸들",labelAccSelectionAffordanceBottom:"아래쪽 선택 핸들",labelEnableNonContiguousSelection:"비연속 선택 사용",labelDisableNonContiguousSelection:"비연속 선택 사용 안함",labelResize:"크기 조정",labelResizeColumn:"열 크기 조정",labelResizePopupSubmit:"확인",labelResizePopupCancel:"취소",labelResizePopupSpinner:"열 크기 조정",labelResizeColumnDialog:"열 크기 조정",labelColumnWidth:"너비(픽셀)",labelResizeDialogApply:"적용",labelSelectRow:"행 선택",labelSelectAllRows:"모든 행 선택",labelEditRow:"행 편집",labelSelectAndEditRow:"행 선택 및 편집",labelSelectColumn:"열 선택",labelSort:"정렬",labelSortAsc:"오름차순 정렬",labelSortDsc:"내림차순 정렬",msgFetchingData:"데이터 인출 중...",msgNoData:"표시할 데이터가 없습니다.",msgInitializing:"초기화 중...",msgColumnResizeWidthValidation:"너비 값은 정수여야 합니다.",msgScrollPolicyMaxCountSummary:"최대 테이블 스크롤 행 수를 초과했습니다.",msgScrollPolicyMaxCountDetail:"더 작은 데이터 세트로 다시 로드하십시오.",msgStatusSortAscending:"{0}이(가) 오름차순으로 정렬됨.",msgStatusSortDescending:"{0} 내림차순으로 정렬.",tooltipRequired:"필수"},"oj-ojTabs":{labelCut:"잘라내기",labelPasteBefore:"앞에 붙여넣기",labelPasteAfter:"뒤에 붙여넣기",labelRemove:"제거",labelReorder:"재정렬",removeCueText:"제거 가능"},"oj-ojCheckboxset":{readonlyNoValue:"",required:{hint:"",messageSummary:"",messageDetail:"값을 선택하십시오."}},"oj-ojRadioset":{readonlyNoValue:"",required:{hint:"",messageSummary:"",messageDetail:"값을 선택하십시오."}},"oj-ojSelect":{required:{hint:"",messageSummary:"",messageDetail:"값을 선택하십시오."},searchField:"검색 필드",noMatchesFound:"일치 항목을 찾을 수 없습니다.",noMoreResults:"더 이상 결과 없음",oneMatchesFound:"일치하는 항목이 한 개 발견되었습니다.",moreMatchesFound:"{num}개의 일치 항목이 발견되었습니다.",filterFurther:"더 많은 결과가 있습니다. 결과를 추가로 필터링하십시오."},"oj-ojSwitch":{SwitchON:"설정",SwitchOFF:"해제"},"oj-ojCombobox":{required:{hint:"",messageSummary:"",messageDetail:""},noMatchesFound:"일치 항목을 찾을 수 없습니다.",noMoreResults:"더 이상 결과 없음",oneMatchesFound:"일치하는 항목이 한 개 발견되었습니다.",moreMatchesFound:"{num}개의 일치 항목이 발견되었습니다.",filterFurther:"더 많은 결과가 있습니다. 결과를 추가로 필터링하십시오."},"oj-ojSelectSingle":{required:{hint:"",messageSummary:"",messageDetail:"값을 선택하십시오."},noMatchesFound:"일치 항목을 찾을 수 없습니다.",oneMatchFound:"일치하는 항목이 한 개 발견되었습니다.",multipleMatchesFound:"{num}개의 일치 항목이 발견되었습니다.",nOrMoreMatchesFound:"{num}개 이상의 일치 항목이 발견되었습니다.",cancel:"취소",labelAccOpenDropdown:"확장",labelAccClearValue:"값 지우기",noResultsLine1:"결과를 찾을 수 없습니다.",noResultsLine2:"검색과 일치하는 항목을 찾지 못했습니다."},"oj-ojInputSearch2":{cancel:"취소",noSuggestionsFound:"제안을 찾을 수 없습니다"},"oj-ojInputSearch":{required:{hint:"",messageSummary:"",messageDetail:""},noMatchesFound:"일치 항목을 찾을 수 없습니다.",oneMatchesFound:"일치하는 항목이 한 개 발견되었습니다.",moreMatchesFound:"{num}개의 일치 항목이 발견되었습니다."},"oj-ojTreeView":{treeViewSelectorAria:"TreeView 선택기 {rowKey}",retrievingDataAria:"노드 데이터 검색: {nodeText}",receivedDataAria:"노드 데이터 수신됨: {nodeText}"},"oj-ojTree":{stateLoading:"로드 중...",labelNewNode:"새 노드",labelMultiSelection:"다중 선택",labelEdit:"편집",labelCreate:"생성",labelCut:"잘라내기",labelCopy:"복사",labelPaste:"붙여넣기",labelPasteAfter:"뒤에 붙여넣기",labelPasteBefore:"앞에 붙여넣기",labelRemove:"제거",labelRename:"이름 바꾸기",labelNoData:"데이터 없음"},"oj-ojPagingControl":{labelAccPaging:"페이지 번호 매김",labelAccPageNumber:"{pageNum} 페이지 콘텐츠가 로드됨",labelAccNavFirstPage:"첫번째 페이지",labelAccNavLastPage:"마지막 페이지",labelAccNavNextPage:"다음 페이지",labelAccNavPreviousPage:"이전 페이지",labelAccNavPage:"페이지",labelLoadMore:"추가 정보 표시...",labelLoadMoreMaxRows:"최대 제한 {maxRows}행에 도달함",labelNavInputPage:"페이지",labelNavInputPageMax:"/{pageMax}",fullMsgItemRange:"{pageFrom}-{pageTo}/{pageMax} 항목",fullMsgItemRangeAtLeast:"{pageFrom}-{pageTo}/최소 {pageMax} 항목",fullMsgItemRangeApprox:"{pageFrom}-{pageTo}/약 {pageMax} 항목",msgItemRangeNoTotal:"{pageFrom}-{pageTo} 항목",fullMsgItem:"{pageTo}/{pageMax}개 항목",fullMsgItemAtLeast:"{pageTo}/최소 {pageMax} 항목",fullMsgItemApprox:"{pageTo}/약 {pageMax} 항목",msgItemNoTotal:"{pageTo} 항목",msgItemRangeCurrent:"{pageFrom}-{pageTo}",msgItemRangeCurrentSingle:"{pageFrom}",msgItemRangeOf:"/",msgItemRangeOfAtLeast:"/ 최소",msgItemRangeOfApprox:"대략",msgItemRangeItems:"항목",tipNavInputPage:"페이지로 이동",tipNavPageLink:"{pageNum} 페이지로 이동",tipNavNextPage:"다음",tipNavPreviousPage:"이전",tipNavFirstPage:"첫번째",tipNavLastPage:"마지막",pageInvalid:{summary:"입력된 페이지 값이 부적합합니다.",detail:"0보다 큰 값을 입력하십시오."},maxPageLinksInvalid:{summary:"maxPageLinks 값이 부적합합니다.",detail:"4보다 큰 값을 입력하십시오."}},"oj-ojMasonryLayout":{labelCut:"잘라내기",labelPasteBefore:"앞에 붙여넣기",labelPasteAfter:"뒤에 붙여넣기"},"oj-panel":{labelAccButtonExpand:"확대",labelAccButtonCollapse:"축소",labelAccButtonRemove:"제거",labelAccFlipForward:"앞으로 플립",labelAccFlipBack:"다시 플립",tipDragToReorder:"재정렬하려면 끌어 놓으십시오.",labelAccDragToReorder:"끌어서 사용 가능한 컨텍스트 메뉴 재정렬"},"oj-ojChart":{labelDefaultGroupName:"그룹 {0}",labelSeries:"계열",labelGroup:"그룹",labelDate:"날짜",labelValue:"값",labelTargetValue:"대상",labelX:"X",labelY:"Y",labelZ:"Z",labelPercentage:"백분율",labelLow:"낮음",labelHigh:"높음",labelOpen:"열기",labelClose:"닫기",labelVolume:"볼륨",labelQ1:"Q1",labelQ2:"Q2",labelQ3:"Q3",labelMin:"최소",labelMax:"최대",labelOther:"기타",tooltipPan:"이동",tooltipSelect:"움직이는 텍스트 선택",tooltipZoom:"움직이는 텍스트 확대/축소",componentName:"차트"},"oj-dvtBaseGauge":{componentName:"게이지"},"oj-ojDiagram":{promotedLink:"{0}개 링크",promotedLinks:"{0}개 링크",promotedLinkAriaDesc:"간접",componentName:"다이어그램"},"oj-ojGantt":{componentName:"Gantt",accessibleDurationDays:"{0}일",accessibleDurationHours:"{0}시간",accessibleTaskInfo:"시작 시간: {0}, 종료 시간: {1}, 기간: {2}",accessibleMilestoneInfo:"시간: {0}",accessibleRowInfo:"행 {0}",accessibleTaskTypeMilestone:"마일스톤",accessibleTaskTypeSummary:"요약",accessiblePredecessorInfo:"{0} 선행 작업",accessibleSuccessorInfo:"{0} 후행 작업",accessibleDependencyInfo:"종속성 유형 {0}, {1}을(를) {2}에 접속",startStartDependencyAriaDesc:"시작-시작",startFinishDependencyAriaDesc:"시작-완료",finishStartDependencyAriaDesc:"완료-시작",finishFinishDependencyAriaDesc:"완료-완료",tooltipZoomIn:"확대",tooltipZoomOut:"축소",labelLevel:"레벨",labelRow:"행",labelStart:"시작",labelEnd:"종료",labelDate:"날짜",labelBaselineStart:"기준 시작",labelBaselineEnd:"기준 종료",labelBaselineDate:"기준 일자",labelDowntimeStart:"작동 중지 시간 시작",labelDowntimeEnd:"작동 중지 시간 끝",labelOvertimeStart:"초과 근무 시작",labelOvertimeEnd:"초과 근무 끝",labelAttribute:"속성",labelLabel:"레이블",labelProgress:"진행",labelMoveBy:"이동 기준",labelResizeBy:"크기 조정 기준",taskMoveInitiated:"작업 이동 시작됨",taskResizeEndInitiated:"작업 크기 조정 종료 시작됨",taskResizeStartInitiated:"작업 크기 조정 시작 시작됨",taskMoveSelectionInfo:"기타 {0}개 선택됨",taskResizeSelectionInfo:"기타 {0}개 선택됨",taskMoveInitiatedInstruction:"화살표 키를 사용하여 이동",taskResizeInitiatedInstruction:"화살표 키를 사용하여 크기 조정",taskMoveFinalized:"작업 이동 완료됨",taskResizeFinalized:"작업 크기 조정 완료됨",taskMoveCancelled:"작업 이동 취소됨",taskResizeCancelled:"작업 크기 조정 취소됨",taskResizeStartHandle:"작업 크기 조정 시작 처리",taskResizeEndHandle:"작업 크기 조정 종료 처리"},"oj-ojLegend":{componentName:"범례",tooltipExpand:"확대",tooltipCollapse:"축소"},"oj-ojNBox":{highlightedCount:"{0}/{1}",labelOther:"기타",labelGroup:"그룹",labelSize:"크기",labelAdditionalData:"추가 데이터",componentName:"{0} 상자"},"oj-ojPictoChart":{componentName:"그림 차트"},"oj-ojSparkChart":{componentName:"차트"},"oj-ojSunburst":{labelColor:"색상",labelSize:"크기",tooltipExpand:"확대",tooltipCollapse:"축소",componentName:"Sunburst"},"oj-ojTagCloud":{componentName:"태그 클라우드"},"oj-ojThematicMap":{componentName:"주제도",areasRegion:"영역",linksRegion:"링크",markersRegion:"표시자"},"oj-ojTimeAxis":{componentName:"시간 축"},"oj-ojTimeline":{componentName:"타임라인",accessibleItemDesc:"설명: {0}.",accessibleItemEnd:"종료 시간: {0}.",accessibleItemStart:"시작 시간: {0}.",accessibleItemTitle:"제목: {0}.",labelSeries:"계열",tooltipZoomIn:"확대",tooltipZoomOut:"축소",labelStart:"시작",labelEnd:"종료",labelAccNavNextPage:"다음 페이지",labelAccNavPreviousPage:"이전 페이지",tipArrowNextPage:"다음",tipArrowPreviousPage:"이전",navArrowDisabledState:"사용 안함",labelDate:"날짜",labelTitle:"제목",labelDescription:"설명",labelMoveBy:"이동 기준",labelResizeBy:"크기 조정 기준",itemMoveInitiated:"항목 이동 시작됨",itemResizeEndInitiated:"항목 크기 조정 끝 시작됨",itemResizeStartInitiated:"항목 크기 조정 시작 시작됨",itemMoveSelectionInfo:"기타 {0}개 선택됨",itemResizeSelectionInfo:"기타 {0}개 선택됨",itemMoveInitiatedInstruction:"화살표 키를 사용하여 이동",itemResizeInitiatedInstruction:"화살표 키를 사용하여 크기 조정",itemMoveFinalized:"항목 이동 완료됨",itemResizeFinalized:"항목 크기 조정 완료됨",itemMoveCancelled:"항목 이동 취소됨",itemResizeCancelled:"항목 크기 조정 취소됨",itemResizeStartHandle:"항목 크기 조정 시작 처리",itemResizeEndHandle:"항목 크기 조정 끝 처리"},"oj-ojTreemap":{labelColor:"색상",labelSize:"크기",tooltipIsolate:"분리",tooltipRestore:"복원",componentName:"트리맵"},"oj-dvtBaseComponent":{labelScalingSuffixThousand:"K",labelScalingSuffixMillion:"M",labelScalingSuffixBillion:"B",labelScalingSuffixTrillion:"T",labelScalingSuffixQuadrillion:"Q",labelInvalidData:"부적합한 데이터",labelNoData:"표시할 데이터 없음",labelClearSelection:"선택 지우기",labelDataVisualization:"데이터 시각화",stateSelected:"선택됨",stateUnselected:"선택 취소됨",stateMaximized:"최대화됨",stateMinimized:"최소화됨",stateExpanded:"확장됨",stateCollapsed:"축소됨",stateIsolated:"분리됨",stateHidden:"숨김",stateVisible:"표시 가능",stateDrillable:"드릴 가능",labelAndValue:"{0}: {1}",labelCountWithTotal:"{0}/{1}",accessibleContainsControls:"콘트롤 포함"},"oj-ojRatingGauge":{labelInvalidData:"부적합한 데이터",labelNoData:"표시할 데이터 없음",labelClearSelection:"선택 지우기",labelDataVisualization:"데이터 시각화",stateSelected:"선택됨",stateUnselected:"선택 취소됨",stateMaximized:"최대화됨",stateMinimized:"최소화됨",stateExpanded:"확장됨",stateCollapsed:"축소됨",stateIsolated:"분리됨",stateHidden:"숨김",stateVisible:"표시 가능",stateDrillable:"드릴 가능",labelAndValue:"{0}: {1}",labelCountWithTotal:"{0}/{1}",accessibleContainsControls:"콘트롤 포함",componentName:"게이지"},"oj-ojStatusMeterGauge":{labelInvalidData:"부적합한 데이터",labelNoData:"표시할 데이터 없음",labelClearSelection:"선택 지우기",labelDataVisualization:"데이터 시각화",stateSelected:"선택됨",stateUnselected:"선택 취소됨",stateMaximized:"최대화됨",stateMinimized:"최소화됨",stateExpanded:"확장됨",stateCollapsed:"축소됨",stateIsolated:"분리됨",stateHidden:"숨김",stateVisible:"표시 가능",stateDrillable:"드릴 가능",labelAndValue:"{0}: {1}",labelCountWithTotal:"{0}/{1}",accessibleContainsControls:"콘트롤 포함",componentName:"게이지"},"oj-ojNavigationList":{defaultRootLabel:"탐색 목록",hierMenuBtnLabel:"계층 메뉴 단추",selectedLabel:"선택됨",previousIcon:"이전",msgFetchingData:"데이터 인출 중...",msgNoData:"표시할 항목이 없습니다.",overflowItemLabel:"더 보기",accessibleReorderTouchInstructionText:"길게 두 번 누릅니다.  소리가 날 때까지 기다렸다가 끌어서 재정렬합니다.",accessibleReorderBeforeItem:"이전 {item}",accessibleReorderAfterItem:"이후 {item}",labelCut:"잘라내기",labelPasteBefore:"앞에 붙여넣기",labelPasteAfter:"뒤에 붙여넣기",labelRemove:"제거",removeCueText:"제거 가능"},"oj-ojSlider":{noValue:"ojSlider에 값이 없습니다.",maxMin:"최대값은 최소값보다 작거나 같아야 합니다.",startEnd:"value.start는 value.end보다 크지 않아야 합니다.",valueRange:"값은 최소값과 최대값 범위 사이에 있어야 합니다.",optionNum:"{option} 옵션은 숫자가 아닙니다.",invalidStep:"부적합한 단계입니다. 단계는 0보다 커야 합니다.",lowerValueThumb:"하위 값 표시기",higherValueThumb:"상위 값 표시기"},"oj-ojDialog":{labelCloseIcon:"닫기"},"oj-ojPopup":{ariaLiveRegionInitialFocusFirstFocusable:"팝업 입력. F6를 눌러 팝업과 연관된 제어 사이를 이동합니다.",ariaLiveRegionInitialFocusNone:"팝업 열림. F6를 눌러 팝업과 연관된 제어 사이를 이동합니다.",ariaLiveRegionInitialFocusFirstFocusableTouch:"팝업 열림. 팝업은 팝업 내의 마지막 링크로 이동하여 닫을 수 있습니다.",ariaLiveRegionInitialFocusNoneTouch:"팝업 열림. 다음 링크로 이동하여 팝업 내의 포커스를 설정할 수 있습니다.",ariaFocusSkipLink:"열린 팝업으로 이동하려면 두 번 누릅니다.",ariaCloseSkipLink:"열린 팝업을 닫으려면 두 번 누릅니다."},"oj-ojRefresher":{ariaRefreshLink:"콘텐츠를 새로 고칠 수 있는 활성화 링크",ariaRefreshingLink:"콘텐츠를 새로 고치는 중",ariaRefreshCompleteLink:"새로고침 완료"},"oj-ojSwipeActions":{ariaShowStartActionsDescription:"시작 작업 표시",ariaShowEndActionsDescription:"종료 작업 표시",ariaHideActionsDescription:"작업 숨기기"},"oj-ojIndexer":{indexerCharacters:"A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z",indexerOthers:"#",ariaDisabledLabel:"일치하는 그룹 머리글을 찾을 수 없음",ariaOthersLabel:"숫자",ariaInBetweenText:"{first}과(와) {second} 사이",ariaKeyboardInstructionText:"Enter 키를 눌러 값을 선택합니다.",ariaTouchInstructionText:"길게 두번 눌러서 제스처 모드로 전환한 다음 위로 또는 아래로 드래그하여 값을 조정합니다."},"oj-ojMenu":{labelCancel:"취소",ariaFocusSkipLink:"초점이 메뉴 내에 있으면 두 번 누르거나 살짝 밀어서 초점을 첫번째 메뉴 항목으로 이동하십시오."},"oj-ojColorSpectrum":{labelHue:"색조",labelOpacity:"불투명도",labelSatLum:"채도/휘도",labelThumbDesc:"색상 스펙트럼 4방향 슬라이더입니다."},"oj-ojColorPalette":{labelNone:"없음"},"oj-ojColorPicker":{labelSwatches:"견본",labelCustomColors:"사용자정의 색상",labelPrevColor:"이전 색상",labelDefColor:"기본 색상",labelDelete:"삭제",labelDeleteQ:"삭제하겠습니까?",labelAdd:"추가",labelAddColor:"색상 추가",labelMenuHex:"HEX",labelMenuRgba:"RGBa",labelMenuHsla:"HSLa",labelSliderHue:"색조",labelSliderSaturation:"채도",labelSliderSat:"채도",labelSliderLightness:"밝기",labelSliderLum:"명도",labelSliderAlpha:"Alpha",labelOpacity:"불투명도",labelSliderRed:"빨강",labelSliderGreen:"녹색",labelSliderBlue:"파랑"},"oj-ojFilePicker":{dropzoneText:"파일을 여기에 끌어 놓거나 눌러서 업로드",singleFileUploadError:"파일을 한 번에 하나씩 업로드하십시오.",singleFileTypeUploadError:"{fileType} 유형의 파일을 업로드할 수 없습니다.",multipleFileTypeUploadError:"{fileTypes} 유형의 파일을 업로드할 수 없습니다.",dropzonePrimaryText:"끌어 놓기",secondaryDropzoneText:"파일을 선택하거나 여기에 끌어 놓기.",secondaryDropzoneTextMultiple:"파일을 선택하거나 여기에 끌어 놓기.",unknownFileType:"알 수 없음"},"oj-ojProgressbar":{ariaIndeterminateProgressText:"진행 중"},"oj-ojMessage":{labelCloseIcon:"닫기",categories:{error:"오류",warning:"경고",info:"정보",confirmation:"확인"}},"oj-ojSelector":{checkboxAriaLabel:"체크박스 선택 {rowKey}",checkboxAriaLabelSelected:" 선택됨",checkboxAriaLabelUnselected:" 선택 취소됨"},"oj-ojMessages":{labelLandmark:"메시지",ariaLiveRegion:{navigationFromKeyboard:"메시지 영역 입력 중. F6를 눌러 이전에 포커스된 요소로 돌아갑니다.",navigationToTouch:"메시지 영역에 새 메시지가 있습니다. VoiceOver 로터를 사용하여 메시지 경계표로 이동합니다.",navigationToKeyboard:"메시지 영역에 새 메시지가 있습니다. F6를 눌러 가장 최근 메시지 영역으로 이동합니다.",newMessage:"메시지 범주 {category}. {summary}. {detail}."}},"oj-ojMessageBanner":{close:"닫기",navigationFromMessagesRegion:"메시지 영역 입력 중. F6를 눌러 이전에 포커스된 요소로 돌아갑니다.",navigationToMessagesRegion:"메시지 영역에 새 메시지가 있습니다. F6를 눌러 가장 최근 메시지 영역으로 이동합니다.",error:"오류",warning:"경고",info:"정보",confirmation:"확인"},"oj-ojConveyorBelt":{tipArrowNext:"다음",tipArrowPrevious:"이전"}});