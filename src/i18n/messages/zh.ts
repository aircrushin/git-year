const messages = {
  header: {
    title: 'GitYear Studio',
    github: 'GitHub',
    switchLabel: '语言',
    switchToZh: '切换为中文',
    switchToEn: '切换为英文',
  },
  home: {
    hero: {
      badge: 'GitHub 年度贡献卡片 · 即刻生成',
      title: '输入 GitHub 用户名，自动聚合今年的 Commit、PR、Issue 与 Star 数据。',
      description:
        'GitYear Studio 直接调用 GitHub API 生成可视化分享卡片，适配亮暗背景，支持一键导出 PNG。可选填 token，避免公共 API 限流。',
      pillRealtime: '实时 API 拉取',
      pillMotion: '交互式动效',
      pillColors: '中英文 UI',
    },
    form: {
      title: '数据表单',
      usernameLabel: 'GitHub 用户名',
      usernamePlaceholder: '例如: gaearon',
      yearLabel: '年份',
      tokenLabel: 'GitHub Token (可选)',
      tokenPlaceholder: '建议使用 fine-grained token，仅勾选 public_repo，避免速率限制。',
      submit: '生成分享卡片',
      loading: '拉取数据中...',
      sample: '用示例',
    },
    errors: {
      fetchFailed: '获取数据失败，请稍后再试。',
      downloadFailed: '卡片导出失败，请确认已解锁浏览器截图权限。',
    },
    statsCards: {
      commits: '提交 Commit',
      prs: '合并 PR',
      issues: 'Issue & 讨论',
      stars: '今年收藏',
    },
    overview: {
      title: '贡献构成与节奏',
      dateRange: '数据区间：{year}-01-01 ~ {year}-12-31',
      breakdown: '贡献占比',
      total: '[{total}]',
      timeline: '全年节奏线',
      frequency: '[FREQ]',
      activityIndex: '活跃指数',
      peak: '最高峰值',
      prCompletion: 'PR 完成率',
    },
    languages: {
      title: '语言偏好',
      hint: '// Active repos language distribution',
      empty: '[NULL] 还没有公开仓库语言数据。',
      reposThisYear: '今年参与仓库：<value>{count}</value> 个',
      reposNote: '// Updated in {year}, reflects active development areas',
    },
    shareCard: {
      title: '分享卡片预览',
      description: '适合发朋友圈 / X / 即刻，点击右上角导出高清 PNG。',
      export: '导出 PNG',
      contributions: '{count} 次年度贡献',
      bioFallback: '这个开发者用代码在 GitHub 留下足迹。',
      shareStats: {
        commits: 'Commits',
        prs: 'Pull Requests',
        issues: 'Issues',
        stars: 'Starred',
      },
    },
    fastShare: {
      title: '快速分享',
      description: '复制一句话战报或直接导出卡片。未登录状态下 GitHub API 存在速率限制，建议填写个人 token。',
      label: '战报文案',
      placeholder: '生成数据后，这里会自动写好一段可复制的年度总结。',
      copyCta: '复制文案',
      viewGithub: '去 GitHub 看看',
    },
    steps: {
      oneTitle: '输入 GitHub 用户名，选定年份',
      oneDesc: '默认使用当年数据，可填写个人 token 以避免未登录的速率限制。',
      twoTitle: '即时请求 GitHub API',
      twoDesc: '聚合 Commit、PR、Issue、Starred、活跃仓库和语言分布，不做本地 mock。',
      threeTitle: '生成分享卡片与图表',
      threeDesc: '可视化进度条 + 节奏线 + 语言雷达，支持一键复制战报或导出 PNG。',
    },
    shareText:
      '我在 {year} 年完成了 {commits} 次提交、{prs} 个 PR、{issues} 个 Issue，并收藏了 {stars} 个项目。生成自 GitYear Studio。',
  },
}

export default messages
