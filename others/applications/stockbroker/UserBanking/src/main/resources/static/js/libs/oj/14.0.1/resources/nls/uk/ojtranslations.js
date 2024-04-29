define({"oj-message":{fatal:"Критично",error:"Помилка",warning:"Попередження",info:"Відомості",confirmation:"Підтвердження","compact-type-summary":"{0}: {1}"},"oj-converter":{summary:"Значення має неправильний формат.",detail:"Введіть значення в правильному форматі.","plural-separator":", ",hint:{summary:"Приклад: {exampleValue}",detail:'Введіть значення в такому форматі: "{exampleValue}".',"detail-plural":'Введіть значення в таких форматах: "{exampleValue}".'},optionHint:{detail:'Прийнятним значенням для параметра "{propertyName}" є "{propertyValueValid}".',"detail-plural":'Прийнятними значеннями для параметра "{propertyName}" є "{propertyValueValid}".'},optionTypesMismatch:{summary:'Значення для параметра "{requiredPropertyName}" є обов\'язковим, якщо для параметра "{propertyName}" вказано значення "{propertyValue}".'},optionTypeInvalid:{summary:'Значення потрібного типу не вказано для параметра "{propertyName}".'},optionOutOfRange:{summary:'Значення {propertyValue} для параметра "{propertyName}" перебуває за межами діапазону.'},optionValueInvalid:{summary:'Для параметра "{propertyName}" було вказано неприпустиме значення "{propertyValue}".'},number:{decimalFormatMismatch:{summary:"Указано значення в неправильному числовому форматі."},shortLongUnsupportedParse:{summary:"Значення short і long не підтримуються для аналізу конвертора.",detail:"Змініть компонент на readonly. Поля readonly не викликають функцію аналізу конвертора."},currencyFormatMismatch:{summary:"Указано значення в неправильному форматі валюти."},percentFormatMismatch:{summary:"Указано значення в неправильному відсотковому форматі."},invalidNumberFormat:{summary:"Указане значення є неприпустимим числом.",detail:"Укажіть припустиме число."}},color:{invalidFormat:{summary:"Неприпустимий формат кольору.",detail:"Неприпустима специфікація параметра формату кольору."},invalidSyntax:{summary:"Неприпустима специфікація кольору.",detail:"Введіть значення кольору, яке відповідає стандарту CSS3."}},datetime:{datetimeOutOfRange:{summary:'Значення "{value}" для "{propertyName}" перебуває за межами діапазону.',detail:'Введіть значення в діапазоні від "{minValue}" до "{maxValue}".',hour:"година",minute:"хвилина",second:"секунда",millisec:"мілісекунда",month:"місяць",day:"день",year:"рік","month name":"назва місяця",weekday:"день тижня"},dateFormatMismatch:{summary:"Указано значення в неправильному форматі дати."},invalidTimeZoneID:{summary:"Надано неприпустимий ідентифікатор часового поясу {timeZoneID}."},nonExistingTime:{summary:"Указане значення часу не існує, оскільки воно припадає на період переходу на літній час."},missingTimeZoneData:{summary:'Дані часового поясу відсутні. Викличте "ojs/ojtimezonedata", щоб завантажити дані часового поясу.'},timeFormatMismatch:{summary:"Указано значення в неправильному форматі часу."},datetimeFormatMismatch:{summary:"Указано значення в неправильному форматі дати й часу."},dateToWeekdayMismatch:{summary:'День "{date}" не збігається з "{weekday}".',detail:"Введіть день тижня, який відповідає цій даті."},invalidISOString:{invalidRangeSummary:'Значення "{value}" для поля "{propertyName}" в рядку внутрішнього замовлення на придбання 8601 "{isoStr}" перебуває за межами діапазону.',summary:'Наданий рядок "{isoStr}" не є припустимим рядком внутрішнього замовлення на придбання 8601.',detail:"Укажіть припустимий рядок внутрішнього замовлення на придбання 8601."}}},"oj-validator":{length:{hint:{min:"Введіть {min} або більше символів.",max:"Введіть {max} або менше символів.",inRange:"Введіть від {min} до {max} символів.",exact:"Введіть таку кількість символів: {length}."},messageDetail:{tooShort:"Введіть {min} або більше символів.",tooLong:"Введіть не більше {max} символів."},messageSummary:{tooShort:"Указано замало символів.",tooLong:"Указано забагато символів"}},range:{number:{hint:{min:"Введіть число більше або рівне {min}.",max:"Введіть число менше або рівне {max}.",inRange:"Введіть число від {min} до {max}.",exact:"Введіть число {num}."},messageDetail:{rangeUnderflow:"Введіть {min} або більше число.",rangeOverflow:"Введіть {max} або менше число.",exact:"Введіть число {num}."},messageSummary:{rangeUnderflow:"Число має бути більшим.",rangeOverflow:"Число має бути меншим."}},datetime:{hint:{min:"Введіть дату й час, які настають не раніше {min}.",max:"Введіть дату й час, які настають не пізніше {max}.",inRange:"Введіть дату й час між {min} і {max}."},messageDetail:{rangeUnderflow:"Введіть дату, яка настає не раніше {min}.",rangeOverflow:"Введіть дату, яка настає не пізніше {max}."},messageSummary:{rangeUnderflow:"Дата та час передують мінімальній даті й часу.",rangeOverflow:"Дата та час настають пізніше максимальної дати та часу."}},date:{hint:{min:"Введіть дату, яка настає не раніше {min}.",max:"Введіть дату, яка настає не пізніше {max}.",inRange:"Введіть дату між {min} і {max}."},messageDetail:{rangeUnderflow:"Введіть дату, яка настає не раніше {min}.",rangeOverflow:"Введіть дату, яка настає не пізніше {max}."},messageSummary:{rangeUnderflow:"Дата передує мінімальній.",rangeOverflow:"Дата настає пізніше максимальної."}},time:{hint:{min:"Введіть час, який настає не раніше {min}.",max:"Введіть час, який настає не пізніше {max}.",inRange:"Введіть час між {min} і {max}."},messageDetail:{rangeUnderflow:"Введіть час, який настає не раніше {min}.",rangeOverflow:"Введіть час, який настає не пізніше {max}."},messageSummary:{rangeUnderflow:"Час передує мінімальному значенню.",rangeOverflow:"Час настає пізніше максимального значення."}}},restriction:{date:{messageSummary:"Дата {value} є вимкненим записом.",messageDetail:"Вибрана дата недоступна. Спробуйте вибрати інше значення."}},regExp:{summary:"Формат неправильний.",detail:'Введіть припустимі значення, описані в цьому регулярному виразі: "{pattern}".'},required:{summary:"Значення є обов'язковим.",detail:"Введіть значення."}},"oj-ojEditableValue":{loading:"Триває завантаження",requiredText:"Обов'язково",helpSourceText:"Подробиці..."},"oj-ojInputDate":{done:"Готово",cancel:"Скасувати",time:"Час",prevText:"Назад",nextText:"Далі",currentText:"Сьогодні",weekHeader:"Тиж.",tooltipCalendar:"Виберіть дату.",tooltipCalendarTime:"Виберіть дату й час.",tooltipCalendarDisabled:"Вибір дати вимкнення.",tooltipCalendarTimeDisabled:"Вибір дати й часу вимкнення.",picker:"Вибір",weekText:"Тиждень",datePicker:"Вибір дати",inputHelp:"Натисніть клавішу вниз або клавішу вгору, щоб отримати доступ до календаря.",inputHelpBoth:'Натисніть клавішу вниз або клавішу вгору, щоб отримати доступ до календаря, а також поєднання клавіш Shift + "Униз" або Shift + "Угору", щоб отримати доступ до розкривного списку часу.',dateTimeRange:{hint:{min:"",max:"",inRange:""},messageDetail:{rangeUnderflow:"",rangeOverflow:""},messageSummary:{rangeUnderflow:"",rangeOverflow:""}},dateRestriction:{hint:"",messageSummary:"",messageDetail:""}},"oj-ojInputTime":{cancelText:"Скасувати",okText:"ОК",currentTimeText:"Зараз",hourWheelLabel:"Година",minuteWheelLabel:"Хвилина",ampmWheelLabel:"До полудня, після полудня",tooltipTime:"Вибір часу.",tooltipTimeDisabled:"Вибір часу вимкнення.",inputHelp:"Натисніть клавішу вниз або клавішу вгору, щоб отримати доступ до розкривного списку часу.",dateTimeRange:{hint:{min:"",max:"",inRange:""},messageDetail:{rangeUnderflow:"",rangeOverflow:""},messageSummary:{rangeUnderflow:"",rangeOverflow:""}}},"oj-inputBase":{required:{hint:"",messageSummary:"",messageDetail:""},regexp:{messageSummary:"",messageDetail:""},accessibleMaxLengthExceeded:"Максимальну довжину {len} перевищено.",accessibleMaxLengthRemaining:"{chars} лишилося (залишкова кількість символів)."},"oj-ojInputText":{accessibleClearIcon:"Очистити"},"oj-ojInputPassword":{regexp:{messageDetail:'Значення має відповідати цьому шаблону: "{pattern}".'},accessibleShowPassword:"Відобразіть пароль.",accessibleHidePassword:"Приховайте пароль."},"oj-ojFilmStrip":{labelAccFilmStrip:"Відображення сторінки {pageIndex} із {pageCount}",labelAccArrowNextPage:'Виберіть "Далі", щоб відобразити наступну сторінку',labelAccArrowPreviousPage:'Виберіть "Назад", щоб відобразити попередню сторінку',tipArrowNextPage:"Далі",tipArrowPreviousPage:"Назад"},"oj-ojDataGrid":{accessibleSortAscending:"{id} відсортовано за зростанням",accessibleSortDescending:"{id} відсортовано за спаданням",accessibleSortable:"{id} із можливістю сортування",accessibleActionableMode:"Увійдіть в активний режим.",accessibleNavigationMode:"Увійдіть у режим навігації, натисніть клавішу F2, щоб увійти в режим редагування або активний режим.",accessibleEditableMode:"Увійдіть у режим редагування, натисніть клавішу Esc, щоб вийти із сітки даних.",accessibleSummaryExact:"Це сітка даних, яка містить {colnum} рядків і {rownum} стовпців",accessibleSummaryEstimate:"Це сітка даних із невідомою кількістю рядків і стовпців",accessibleSummaryExpanded:"Наразі розгорнуто таку кількість рядків: {num}",accessibleRowExpanded:"Рядки розгорнуто",accessibleExpanded:"Розгорнуто",accessibleRowCollapsed:"Рядки згорнуто",accessibleCollapsed:"Згорнуто",accessibleRowSelected:"Вибрано рядків: {row}",accessibleColumnSelected:"Вибрано стовпців: {column}",accessibleStateSelected:"вибрано",accessibleMultiCellSelected:"Вибрано комірок: {num}",accessibleColumnSpanContext:"Ширина: {extent}",accessibleRowSpanContext:"Висота: {extent}",accessibleRowContext:"Рядок {index}",accessibleColumnContext:"Стовпець {index}",accessibleRowHeaderContext:"Заголовок рядка {index}",accessibleColumnHeaderContext:"Заголовок стовпця {index}",accessibleRowEndHeaderContext:"Заголовок завершення рядка {index}",accessibleColumnEndHeaderContext:"Заголовок завершення стовпця {index}",accessibleRowHeaderLabelContext:"Напис заголовка рядка {level}",accessibleColumnHeaderLabelContext:"Напис заголовка стовпця {level}",accessibleRowEndHeaderLabelContext:"Напис заголовка завершення рядка {level}",accessibleColumnEndHeaderLabelContext:"Напис заголовка завершення стовпця {level}",accessibleLevelContext:"Рівень {level}",accessibleRangeSelectModeOn:"Режим додавання вибраного діапазону комірок увімкнено.",accessibleRangeSelectModeOff:"Режим додавання вибраного діапазону комірок вимкнено.",accessibleFirstRow:"Досягнуто першого рядка.",accessibleLastRow:"Досягнуто останнього рядка.",accessibleFirstColumn:"Досягнуто першого стовпця.",accessibleLastColumn:"Досягнуто останнього стовпця.",accessibleSelectionAffordanceTop:"Верхній маркер виділення.",accessibleSelectionAffordanceBottom:"Нижній маркер виділення.",accessibleLevelHierarchicalContext:"Рівень {level}",accessibleRowHierarchicalFull:"Рядок {posInSet} із {setSize}",accessibleRowHierarchicalPartial:"Рядок {posInSet} з останніх {setSize}",accessibleRowHierarchicalUnknown:"Останній рядок {posInSet} з останніх {setSize}",accessibleColumnHierarchicalFull:"Стовпець {posInSet} із {setSize}",accessibleColumnHierarchicalPartial:"Стовпець {posInSet} з останніх {setSize}",accessibleColumnHierarchicalUnknown:"Останній стовпець {posInSet} з останніх {setSize}",msgFetchingData:"Отримання даних...",msgNoData:"Немає позицій для відображення.",labelResize:"Змінити розмір",labelResizeWidth:"Змінити ширину",labelResizeHeight:"Змінити висоту",labelSortAsc:"Сортувати за зростанням",labelSortDsc:"Сортувати за спаданням",labelSortRow:"Сортувати рядки",labelSortRowAsc:"Сортувати рядки за зростанням",labelSortRowDsc:"Сортувати рядки за спаданням",labelSortCol:"Сортувати стовпці",labelSortColAsc:"Сортувати стовпці за зростанням",labelSortColDsc:"Сортувати стовпці за спаданням",labelCut:"Вирізати",labelPaste:"Вставити",labelCutCells:"Вирізати",labelPasteCells:"Вставити",labelCopyCells:"Копіювати",labelAutoFill:"Автоматичне заповнення",labelEnableNonContiguous:"Увімкнути несуцільне виділення",labelDisableNonContiguous:"Вимкнути несуцільне виділення",labelResizeDialogSubmit:"ОК",labelResizeDialogCancel:"Скасувати",accessibleContainsControls:"Містить елементи керування",labelSelectMultiple:"Вибрати кілька елементів",labelResizeDialogApply:"Застосувати",labelResizeFitToContent:"Припасувати розмір",columnWidth:"Ширина в пікселях",rowHeight:"Висота в пікселях",labelResizeColumn:"Змінити розмір стовпця",labelResizeRow:"Змінити розмір рядка",resizeColumnDialog:"Змінити розмір стовпця",resizeRowDialog:"Змінити розмір рядка",collapsedText:"Згорнути",expandedText:"Розгорнути",tooltipRequired:"Обов'язково"},"oj-ojRowExpander":{accessibleLevelDescription:"Рівень {level}",accessibleRowDescription:"Рівень {level}, рядок {num} із {total}",accessibleRowExpanded:"Рядки розгорнуто",accessibleRowCollapsed:"Рядки згорнуто",accessibleStateExpanded:"розгорнуто",accessibleStateCollapsed:"згорнуто"},"oj-ojStreamList":{msgFetchingData:"Отримання даних..."},"oj-ojListView":{msgFetchingData:"Отримання даних...",msgNoData:"Немає позицій для відображення.",msgItemsAppended:"У кінець додано таку кількість позицій: {count}.",msgFetchCompleted:"Усі позиції отримано.",indexerCharacters:"A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z",accessibleReorderTouchInstructionText:"Двічі торкніться й утримайте. Зачекайте, поки пролунає звук і перетягніть, щоб змінити порядок.",accessibleReorderBeforeItem:"Перед {item}",accessibleReorderAfterItem:"Після {item}",accessibleReorderInsideItem:"Усередину {item}",accessibleNavigateSkipItems:"Пропустити таку кількість позицій: {numSkip}",labelCut:"Вирізати",labelCopy:"Копіювати",labelPaste:"Вставити",labelPasteBefore:"Вставити перед",labelPasteAfter:"Вставити після"},"oj-ojWaterfallLayout":{msgFetchingData:"Отримання даних..."},"oj-_ojLabel":{tooltipHelp:"Довідка",tooltipRequired:"Обов'язково"},"oj-ojLabel":{tooltipHelp:"Довідка",tooltipRequired:"Обов'язково"},"oj-ojInputNumber":{required:{hint:"",messageSummary:"",messageDetail:""},numberRange:{hint:{min:"",max:"",inRange:"",exact:""},messageDetail:{rangeUnderflow:"",rangeOverflow:"",exact:""},messageSummary:{rangeUnderflow:"",rangeOverflow:""}},tooltipDecrement:"Зменшення",tooltipIncrement:"Приріст"},"oj-ojTable":{accessibleAddRow:"Введіть дані, щоб додати новий рядок.",accessibleColumnContext:"Стовпець {index}",accessibleColumnFooterContext:"Нижній колонтитул стовпця {index}",accessibleColumnHeaderContext:"Заголовок стовпця {index}",accessibleContainsControls:"Містить елементи керування",accessibleColumnsSpan:"Проміжки, стовпців: {count}",accessibleRowContext:"Рядок {index}",accessibleSortable:"{id} із можливістю сортування",accessibleSortAscending:"{id} відсортовано за зростанням",accessibleSortDescending:"{id} відсортовано за спаданням",accessibleStateSelected:"вибрано",accessibleStateUnselected:"не вибрано",accessibleSummaryEstimate:"Таблиця з {colnum} стовпцями та більш ніж {rownum} рядками",accessibleSummaryExact:"Таблиця з {colnum} стовпцями та {rownum} рядками",labelAccSelectionAffordanceTop:"Верхній маркер виділення",labelAccSelectionAffordanceBottom:"Нижній маркер виділення",labelEnableNonContiguousSelection:"Увімкнути несуцільне виділення",labelDisableNonContiguousSelection:"Вимкнути несуцільне виділення",labelResize:"Змінити розмір",labelResizeColumn:"Змінити розмір стовпця",labelResizePopupSubmit:"ОК",labelResizePopupCancel:"Скасувати",labelResizePopupSpinner:"Змінити розмір стовпця",labelResizeColumnDialog:"Змінити розмір стовпця",labelColumnWidth:"Ширина в пікселях",labelResizeDialogApply:"Застосувати",labelSelectRow:"Вибрати рядок",labelSelectAllRows:"Вибрати всі рядки",labelEditRow:"Редагувати рядок",labelSelectAndEditRow:"Вибрати та редагувати рядок",labelSelectColumn:"Вибрати стовпчик",labelSort:"Сортувати",labelSortAsc:"Сортувати за зростанням",labelSortDsc:"Сортувати за спаданням",msgFetchingData:"Отримання даних...",msgNoData:"Немає даних для відображення.",msgInitializing:"Ініціалізація...",msgColumnResizeWidthValidation:"Значення ширини має бути цілим числом",msgScrollPolicyMaxCountSummary:"Перевищено максимальну кількість рядків для прокручування таблиці.",msgScrollPolicyMaxCountDetail:"Перезавантажте, використавши менший набір даних.",msgStatusSortAscending:"{0} відсортовано за зростанням.",msgStatusSortDescending:"{0} відсортовано за спаданням.",tooltipRequired:"Обов'язково"},"oj-ojTabs":{labelCut:"Вирізати",labelPasteBefore:"Вставити перед",labelPasteAfter:"Вставити після",labelRemove:"Вилучити",labelReorder:"Перевпорядкувати",removeCueText:"Видаляється"},"oj-ojCheckboxset":{readonlyNoValue:"",required:{hint:"",messageSummary:"",messageDetail:"Виберіть значення."}},"oj-ojRadioset":{readonlyNoValue:"",required:{hint:"",messageSummary:"",messageDetail:"Виберіть значення."}},"oj-ojSelect":{required:{hint:"",messageSummary:"",messageDetail:"Виберіть значення."},searchField:"Поле пошуку",noMatchesFound:"Збігів не знайдено",noMoreResults:"Більше результатів немає",oneMatchesFound:"Знайдено один збіг",moreMatchesFound:"Знайдено таку кількість збігів: {num}",filterFurther:"Доступні інші результати. Продовжте фільтрування."},"oj-ojSwitch":{SwitchON:"Увімк.",SwitchOFF:"Вимк."},"oj-ojCombobox":{required:{hint:"",messageSummary:"",messageDetail:""},noMatchesFound:"Збігів не знайдено",noMoreResults:"Більше результатів немає",oneMatchesFound:"Знайдено один збіг",moreMatchesFound:"Знайдено таку кількість збігів: {num}",filterFurther:"Доступні інші результати. Продовжте фільтрування."},"oj-ojSelectSingle":{required:{hint:"",messageSummary:"",messageDetail:"Виберіть значення."},noMatchesFound:"Збігів не знайдено",oneMatchFound:"Знайдено один збіг",multipleMatchesFound:"Знайдено таку кількість збігів: {num}",nOrMoreMatchesFound:"Знайдено {num} або більше збігів",cancel:"Скасувати",labelAccOpenDropdown:"розгорнути",labelAccClearValue:"очистити значення",noResultsLine1:"Результати не знайдено",noResultsLine2:"Не вдалося знайти результати за вашим пошуковим запитом."},"oj-ojInputSearch2":{cancel:"Скасувати",noSuggestionsFound:"Не знайдено жодних пропозицій"},"oj-ojInputSearch":{required:{hint:"",messageSummary:"",messageDetail:""},noMatchesFound:"Збігів не знайдено",oneMatchesFound:"Знайдено один збіг",moreMatchesFound:"Знайдено таку кількість збігів: {num}"},"oj-ojTreeView":{treeViewSelectorAria:"Селектор для подання дерева {rowKey}",retrievingDataAria:"Витягнення даних для вузла: {nodeText}",receivedDataAria:"Отримано дані для вузла: {nodeText}"},"oj-ojTree":{stateLoading:"Завантаження...",labelNewNode:"Створити вузол",labelMultiSelection:"Множинний вибір",labelEdit:"Редагувати",labelCreate:"Створити",labelCut:"Вирізати",labelCopy:"Копіювати",labelPaste:"Вставити",labelPasteAfter:"Вставити після",labelPasteBefore:"Вставити перед",labelRemove:"Вилучити",labelRename:"Перейменувати",labelNoData:"Немає даних"},"oj-ojPagingControl":{labelAccPaging:"Поділ на сторінки",labelAccPageNumber:"Вміст сторінки {pageNum} завантажено",labelAccNavFirstPage:"Перша сторінка",labelAccNavLastPage:"Остання сторінка",labelAccNavNextPage:"Наступна сторінка",labelAccNavPreviousPage:"Попередня сторінка",labelAccNavPage:"Сторінка",labelLoadMore:"Показати більше...",labelLoadMoreMaxRows:"Досягнуто обмеження максимальної кількості рядків ({maxRows})",labelNavInputPage:"Сторінка",labelNavInputPageMax:"із {pageMax}",fullMsgItemRange:"{pageFrom}-{pageTo} такої кількості позицій: {pageMax}",fullMsgItemRangeAtLeast:"{pageFrom}-{pageTo} принаймні такої кількості позицій: {pageMax}",fullMsgItemRangeApprox:"{pageFrom}-{pageTo} приблизно такої кількості позицій: {pageMax}",msgItemRangeNoTotal:"Позицій: {pageFrom}-{pageTo}",fullMsgItem:"Позицій: {pageTo} з {pageMax}",fullMsgItemAtLeast:"{pageTo} принаймні такої кількості позицій: {pageMax}",fullMsgItemApprox:"{pageTo} приблизно такої кількості позицій: {pageMax}",msgItemNoTotal:"Позицій: {pageTo}",msgItemRangeCurrent:"{pageFrom}-{pageTo}",msgItemRangeCurrentSingle:"{pageFrom}",msgItemRangeOf:"для",msgItemRangeOfAtLeast:"принаймні такої кількості",msgItemRangeOfApprox:"приблизно такої кількості",msgItemRangeItems:"позицій",tipNavInputPage:"Перейти на сторінку",tipNavPageLink:"Перейти на сторінку {pageNum}",tipNavNextPage:"Далі",tipNavPreviousPage:"Назад",tipNavFirstPage:"Перша",tipNavLastPage:"Остання",pageInvalid:{summary:"Указано неприпустиме значення сторінки.",detail:"Введіть значення більше за 0."},maxPageLinksInvalid:{summary:"Значення для maxPageLinks неприпустиме.",detail:"Введіть значення більше за 4."}},"oj-ojMasonryLayout":{labelCut:"Вирізати",labelPasteBefore:"Вставити перед",labelPasteAfter:"Вставити після"},"oj-panel":{labelAccButtonExpand:"Розгорнути",labelAccButtonCollapse:"Згорнути",labelAccButtonRemove:"Вилучити",labelAccFlipForward:"Перегорнути вперед",labelAccFlipBack:"Перегорнути назад",tipDragToReorder:"Перетягнути, щоб перевпорядкувати",labelAccDragToReorder:"Доступне контекстне меню, функція перетягування для перевпорядкування"},"oj-ojChart":{labelDefaultGroupName:"Група {0}",labelSeries:"Серія",labelGroup:"Група",labelDate:"Дата",labelValue:"Значення",labelTargetValue:"Ціль",labelX:"Х",labelY:"Y",labelZ:"Z",labelPercentage:"Відсоток",labelLow:"Низький",labelHigh:"Високий",labelOpen:"Відкрити",labelClose:"Закрити",labelVolume:"Обсяг",labelQ1:"Q1",labelQ2:"Q2",labelQ3:"Q3",labelMin:"Мін.",labelMax:"Макс.",labelOther:"Інше",tooltipPan:"Прокрутка",tooltipSelect:"Вибрати рухомий рядок",tooltipZoom:"Змінити масштаб рухомого рядка",componentName:"Діаграма"},"oj-dvtBaseGauge":{componentName:"Шкала"},"oj-ojDiagram":{promotedLink:"{0} посилання",promotedLinks:"Посилання {0}",promotedLinkAriaDesc:"Непряме",componentName:"Схема"},"oj-ojGantt":{componentName:"Діаграма Ґанта",accessibleDurationDays:"{0} дн.",accessibleDurationHours:"{0} год.",accessibleTaskInfo:"Час початку - {0}, час завершення - {1}, тривалість - {2}",accessibleMilestoneInfo:"Час - {0}",accessibleRowInfo:"Рядок {0}",accessibleTaskTypeMilestone:"Віха",accessibleTaskTypeSummary:"Зведення",accessiblePredecessorInfo:"{0} попередники",accessibleSuccessorInfo:"{0} наступники",accessibleDependencyInfo:"Тип залежності {0}, з'єднує {1} з {2}",startStartDependencyAriaDesc:"початок-після-початку",startFinishDependencyAriaDesc:"початок-після-завершення",finishStartDependencyAriaDesc:"завершення-після-початку",finishFinishDependencyAriaDesc:"завершення-після-завершення",tooltipZoomIn:"Збільшення",tooltipZoomOut:"Зменшення",labelLevel:"Рівень",labelRow:"Рядок",labelStart:"Початок",labelEnd:"Завершення",labelDate:"Дата",labelBaselineStart:"Базовий початок",labelBaselineEnd:"Базове завершення",labelBaselineDate:"Дата базового плану",labelDowntimeStart:"Час початку простою",labelDowntimeEnd:"Час завершення простою",labelOvertimeStart:"Час початку надурочних годин",labelOvertimeEnd:"Час завершення надурочних годин",labelAttribute:"Атрибут",labelLabel:"Напис",labelProgress:"Перебіг",labelMoveBy:"Перенести на",labelResizeBy:"Змінити розмір на",taskMoveInitiated:"Завдання перенесення ініційовано",taskResizeEndInitiated:"Завершення завдання змінення розміру ініційовано",taskResizeStartInitiated:"Початок завдання змінення розміру ініційовано",taskMoveSelectionInfo:"Вибрано ще {0}",taskResizeSelectionInfo:"Вибрано ще {0}",taskMoveInitiatedInstruction:"Щоб перемістити, скористайтеся клавішами зі стрілками",taskResizeInitiatedInstruction:"Щоб змінити розмір, скористайтеся клавішами зі стрілками",taskMoveFinalized:"Завдання перенесення завершено",taskResizeFinalized:"Завдання змінення розміру завершено",taskMoveCancelled:"Завдання перенесення скасовано",taskResizeCancelled:"Завдання змінення розміру скасовано",taskResizeStartHandle:"Маркер початку завдання змінення розміру",taskResizeEndHandle:"Маркер завершення завдання змінення розміру"},"oj-ojLegend":{componentName:"Умовне позначення",tooltipExpand:"Розгорнути",tooltipCollapse:"Згорнути"},"oj-ojNBox":{highlightedCount:"{0}/{1}",labelOther:"Інше",labelGroup:"Група",labelSize:"Розмір",labelAdditionalData:"Додаткові дані",componentName:"{0} Поле"},"oj-ojPictoChart":{componentName:"Діаграма зображень"},"oj-ojSparkChart":{componentName:"Діаграма"},"oj-ojSunburst":{labelColor:"Колір",labelSize:"Розмір",tooltipExpand:"Розгорнути",tooltipCollapse:"Згорнути",componentName:"Сегментна діаграма"},"oj-ojTagCloud":{componentName:"Тег Cloud"},"oj-ojThematicMap":{componentName:"Тематична карта",areasRegion:"Регіони",linksRegion:"Посилання",markersRegion:"Маркери"},"oj-ojTimeAxis":{componentName:"Вісь часу"},"oj-ojTimeline":{componentName:"Часова шкала",accessibleItemDesc:"Опис - {0}.",accessibleItemEnd:"Час завершення - {0}.",accessibleItemStart:"Час початку - {0}.",accessibleItemTitle:"Заголовок - {0}.",labelSeries:"Серія",tooltipZoomIn:"Збільшення",tooltipZoomOut:"Зменшення",labelStart:"Початок",labelEnd:"Завершення",labelAccNavNextPage:"Наступна сторінка",labelAccNavPreviousPage:"Попередня сторінка",tipArrowNextPage:"Далі",tipArrowPreviousPage:"Назад",navArrowDisabledState:"Вимкнено",labelDate:"Дата",labelTitle:"Заголовок ",labelDescription:"Опис",labelMoveBy:"Перенести на",labelResizeBy:"Змінити розмір на",itemMoveInitiated:"Ініційовано переміщення елемента",itemResizeEndInitiated:"Завершення змінення розміру елемента ініційовано",itemResizeStartInitiated:"Початок змінення розміру елемента ініційовано",itemMoveSelectionInfo:"Вибрано ще {0}",itemResizeSelectionInfo:"Вибрано ще {0}",itemMoveInitiatedInstruction:"Щоб перемістити, скористайтеся клавішами зі стрілками",itemResizeInitiatedInstruction:"Щоб змінити розмір, скористайтеся клавішами зі стрілками",itemMoveFinalized:"Перенесення елемента завершено",itemResizeFinalized:"Змінення розміру елемента завершено",itemMoveCancelled:"Перенесення елемента скасовано",itemResizeCancelled:"Змінення розміру елемента скасовано",itemResizeStartHandle:"Маркер початку змінення розміру елемента",itemResizeEndHandle:"Маркер завершення змінення розміру елемента"},"oj-ojTreemap":{labelColor:"Колір",labelSize:"Розмір",tooltipIsolate:"Ізолювати",tooltipRestore:"Відновити",componentName:"Деревовидна карта"},"oj-dvtBaseComponent":{labelScalingSuffixThousand:"тис.",labelScalingSuffixMillion:"млн",labelScalingSuffixBillion:"млрд",labelScalingSuffixTrillion:"трлн",labelScalingSuffixQuadrillion:"квадрлн",labelInvalidData:"Неприпустимі дані",labelNoData:"Немає даних для відображення",labelClearSelection:"Скасувати вибір",labelDataVisualization:"Візуалізація даних",stateSelected:"Вибрано",stateUnselected:"Не вибрано",stateMaximized:"Розгорнуто",stateMinimized:"Згорнуто",stateExpanded:"Розгорнуто",stateCollapsed:"Згорнуто",stateIsolated:"Ізольовано",stateHidden:"Приховано",stateVisible:"Видимий",stateDrillable:"З можливістю деталізування",labelAndValue:"{0}: {1}",labelCountWithTotal:"{0} з {1}",accessibleContainsControls:"Містить елементи керування"},"oj-ojRatingGauge":{labelInvalidData:"Неприпустимі дані",labelNoData:"Немає даних для відображення",labelClearSelection:"Скасувати вибір",labelDataVisualization:"Візуалізація даних",stateSelected:"Вибрано",stateUnselected:"Не вибрано",stateMaximized:"Розгорнуто",stateMinimized:"Згорнуто",stateExpanded:"Розгорнуто",stateCollapsed:"Згорнуто",stateIsolated:"Ізольовано",stateHidden:"Приховано",stateVisible:"Видимий",stateDrillable:"З можливістю деталізування",labelAndValue:"{0}: {1}",labelCountWithTotal:"{0} з {1}",accessibleContainsControls:"Містить елементи керування",componentName:"Шкала"},"oj-ojStatusMeterGauge":{labelInvalidData:"Неприпустимі дані",labelNoData:"Немає даних для відображення",labelClearSelection:"Скасувати вибір",labelDataVisualization:"Візуалізація даних",stateSelected:"Вибрано",stateUnselected:"Не вибрано",stateMaximized:"Розгорнуто",stateMinimized:"Згорнуто",stateExpanded:"Розгорнуто",stateCollapsed:"Згорнуто",stateIsolated:"Ізольовано",stateHidden:"Приховано",stateVisible:"Видимий",stateDrillable:"З можливістю деталізування",labelAndValue:"{0}: {1}",labelCountWithTotal:"{0} з {1}",accessibleContainsControls:"Містить елементи керування",componentName:"Шкала"},"oj-ojNavigationList":{defaultRootLabel:"Список навігації",hierMenuBtnLabel:"Кнопка ієрархічного меню",selectedLabel:"вибрано",previousIcon:"Назад",msgFetchingData:"Отримання даних...",msgNoData:"Немає позицій для відображення.",overflowItemLabel:"Більше",accessibleReorderTouchInstructionText:"Двічі торкніться й утримайте. Зачекайте, поки пролунає звук і перетягніть, щоб змінити порядок.",accessibleReorderBeforeItem:"Перед {item}",accessibleReorderAfterItem:"Після {item}",labelCut:"Вирізати",labelPasteBefore:"Вставити перед",labelPasteAfter:"Вставити після",labelRemove:"Вилучити",removeCueText:"Видаляється"},"oj-ojSlider":{noValue:"Для ojSlider не вказано значення",maxMin:"Максимальне значення має бути менше або дорівнювати мінімальному",startEnd:"Значення value.start не повинно перевищувати value.end",valueRange:"Значення має належати до діапазону між мінімальною та максимальною величиною",optionNum:"Параметр {option} не є числом",invalidStep:"Неприпустимий крок; крок має бути > 0",lowerValueThumb:"ескіз меншого значення",higherValueThumb:"ескіз більшого значення"},"oj-ojDialog":{labelCloseIcon:"Закрити"},"oj-ojPopup":{ariaLiveRegionInitialFocusFirstFocusable:"Вхід у спливаюче вікно. Натисніть клавішу F6 для переходу між спливаючим вікном і відповідним елементом керування.",ariaLiveRegionInitialFocusNone:"Спливаюче вікно відкрито. Натисніть клавішу F6 для переходу між спливаючим вікном і відповідним елементом керування.",ariaLiveRegionInitialFocusFirstFocusableTouch:"Вхід у спливаюче вікно. Спливаюче вікно можна закрити, перейшовши до останнього посилання в спливаючому вікні.",ariaLiveRegionInitialFocusNoneTouch:"Спливаюче вікно відкрито. Перейдіть до наступного посилання, щоб установити фокус у спливаючому вікні.",ariaFocusSkipLink:"Двічі торкніться, щоб перейти до відкритого спливаючого вікна.",ariaCloseSkipLink:"Двічі торкніться, щоб закрити відкрите спливаюче вікно."},"oj-ojRefresher":{ariaRefreshLink:"Активуйте посилання, щоб оновити вміст",ariaRefreshingLink:"Оновлення вмісту",ariaRefreshCompleteLink:"Оновлення завершено"},"oj-ojSwipeActions":{ariaShowStartActionsDescription:"Показати початкові дії",ariaShowEndActionsDescription:"Показати завершальні дії",ariaHideActionsDescription:"Приховати дії"},"oj-ojIndexer":{indexerCharacters:"A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z",indexerOthers:"#",ariaDisabledLabel:"Немає відповідного заголовка групи",ariaOthersLabel:"число",ariaInBetweenText:"Від {first} до {second}",ariaKeyboardInstructionText:"Натисніть клавішу Enter, щоб вибрати значення.",ariaTouchInstructionText:"Двічі торкніться й утримайте, щоб увійти в режим жестів, а потім перетягніть угору або вниз, щоб змінити значення."},"oj-ojMenu":{labelCancel:"Скасувати",ariaFocusSkipLink:"Фокус установлено на меню, двічі торкніться або проведіть пальцем, щоб перемістити фокус на перший пункт меню."},"oj-ojColorSpectrum":{labelHue:"Відтінок",labelOpacity:"Прозорість",labelSatLum:"Насиченість/яскравість",labelThumbDesc:"Повзунок колірного спектра з чотирма напрямками."},"oj-ojColorPalette":{labelNone:"Немає"},"oj-ojColorPicker":{labelSwatches:"Палітри",labelCustomColors:"Користувацькі кольори",labelPrevColor:"Попередній колір",labelDefColor:"Стандартний колір",labelDelete:"Видалити",labelDeleteQ:"Видалити?",labelAdd:"Додати",labelAddColor:"Додати колір",labelMenuHex:"Шістнадцятковий формат",labelMenuRgba:"RGBa",labelMenuHsla:"HSLa",labelSliderHue:"Відтінок",labelSliderSaturation:"Насиченість",labelSliderSat:"Насиченість",labelSliderLightness:"Яскравість",labelSliderLum:"Яскравість",labelSliderAlpha:"Альфа-версія",labelOpacity:"Прозорість",labelSliderRed:"Червоний",labelSliderGreen:"Зелений",labelSliderBlue:"Блакитний"},"oj-ojFilePicker":{dropzoneText:"Перетягніть файли сюди або клацніть, щоб завантажити",singleFileUploadError:"Передайте один файл за раз.",singleFileTypeUploadError:"Неможливо передати файл типу {fileType}.",multipleFileTypeUploadError:"Неможливо передати файли типів {fileTypes}.",dropzonePrimaryText:"Перетягнути",secondaryDropzoneText:"Виберіть файл або перетягніть його сюди.",secondaryDropzoneTextMultiple:"Виберіть файли або перетягніть їх сюди.",unknownFileType:"невідомо"},"oj-ojProgressbar":{ariaIndeterminateProgressText:"Триває"},"oj-ojMessage":{labelCloseIcon:"Закрити",categories:{error:"Помилка",warning:"Попередження",info:"Відомості",confirmation:"Підтвердження"}},"oj-ojSelector":{checkboxAriaLabel:"Установлено прапорець {rowKey}",checkboxAriaLabelSelected:" вибрано",checkboxAriaLabelUnselected:" не вибрано"},"oj-ojMessages":{labelLandmark:"Повідомлення",ariaLiveRegion:{navigationFromKeyboard:"Вхід в область повідомлень. Натисніть клавішу F6, щоб повернутися до елемента, на якому раніше було встановлено фокус.",navigationToTouch:"В області повідомлень наявні нові повідомлення. Скористайтеся ротором VoiceOver, щоб перейти до орієнтира повідомлень.",navigationToKeyboard:"В області повідомлень наявні нові повідомлення. Натисніть клавішу F6, щоб перейти до останньої області повідомлень.",newMessage:"Категорія повідомлень {category}. {summary}. {detail}."}},"oj-ojMessageBanner":{close:"Закрити",navigationFromMessagesRegion:"Вхід в область повідомлень. Натисніть клавішу F6, щоб повернутися до елемента, на якому раніше було встановлено фокус.",navigationToMessagesRegion:"В області повідомлень наявні нові повідомлення. Натисніть клавішу F6, щоб перейти до останньої області повідомлень.",error:"Помилка",warning:"Попередження",info:"Відомості",confirmation:"Підтвердження"},"oj-ojConveyorBelt":{tipArrowNext:"Далі",tipArrowPrevious:"Назад"}});