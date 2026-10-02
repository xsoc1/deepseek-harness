/** Locale-owned labels for the local Markdown editor. */
export const en = {
  tab: 'Memory', loading: 'Loading…', error: 'Failed to read memory', refresh: 'Refresh', retry: 'Retry',
  statusTitle: 'Local memory', store: 'Store', countPages: 'Pages', countNotes: 'Notes', bytes: 'Size',
  size: '{n} bytes', viewPages: 'Pages', viewNotes: 'Notes', viewSearch: 'Search',
  pagesEmpty: 'No knowledge pages in the configured store.', notesEmpty: 'No memory notes', noteTotal: '{n} notes',
  prev: 'Previous', next: 'Next', back: 'Back to list', pageDetail: 'Content', emptyContent: '(empty)',
  searchPlaceholder: 'Search memory…', searchBtn: 'Search', searchEmpty: 'Type keywords to search pages and notes',
  resultsNone: 'No matching memories', writeNote: 'Write a note', writeTitlePlaceholder: 'Title (optional)',
  writeTextPlaceholder: 'Memory content…', save: 'Save', saved: 'Saved: {n}', badgeOk: 'local',
}
/** Chinese dictionary with the same keys as the English dictionary. */
export const zh: Record<keyof typeof en, string> = {
  tab: '记忆', loading: '加载中…', error: '读取记忆失败', refresh: '刷新', retry: '重试',
  statusTitle: '本地记忆存储', store: '存储位置', countPages: '知识页', countNotes: '记忆条目', bytes: '占用空间',
  size: '{n} 字节', viewPages: '知识页', viewNotes: '记忆条目', viewSearch: '搜索',
  pagesEmpty: '配置的存储目录中暂无知识页。', notesEmpty: '暂无记忆条目', noteTotal: '共 {n} 条',
  prev: '上一页', next: '下一页', back: '返回列表', pageDetail: '内容', emptyContent: '（空）',
  searchPlaceholder: '搜索记忆内容…', searchBtn: '搜索', searchEmpty: '输入关键词搜索知识页与记忆条目',
  resultsNone: '没有匹配的记忆', writeNote: '写一条记忆', writeTitlePlaceholder: '标题（可选）',
  writeTextPlaceholder: '记忆内容…', save: '保存', saved: '已保存：{n}', badgeOk: '本地',
}
