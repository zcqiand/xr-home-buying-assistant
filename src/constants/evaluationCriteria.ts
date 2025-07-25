// 评估配置按维度分组
export const evaluationConfig = {
  // 地理位置评估配置
  location: {
    "商业": [
      { id: "A1", label: "核心商业/金融中心", min: 25, max: 30 },
      { id: "B1", label: "区域性商业中心", min: 20, max: 25 },
      { id: "C1", label: "新兴开发区/组团", min: 15, max: 20 },
      { id: "D1", label: "远郊乡镇/工业区", min: 10, max: 15 }
    ],
    "教育": [
      { id: "A2", label: "顶级教育资源", min: 25, max: 30 },
      { id: "B2", label: "优质教育资源", min: 20, max: 25 },
      { id: "C2", label: "普通教育资源", min: 15, max: 20 },
      { id: "D2", label: "基础教育为主", min: 10, max: 15 }
    ],
    "交通": [
      { id: "A3", label: "核心交通枢纽", min: 15, max: 20 },
      { id: "B3", label: "主要交通干线", min: 10, max: 15 },
      { id: "C3", label: "轨道交通远/规划中", min: 5, max: 10 },
      { id: "D3", label: "公共交通稀疏", min: 5, max: 8 }
    ],
    "景观": [
      { id: "A4", label: "稀缺自然/人文景观", min: 10, max: 15 },
      { id: "B5", label: "区域性休闲景观", min: 5, max: 9 },
      { id: "C5", label: "缺乏明显景观", min: 5, max: 8 },
      { id: "D5", label: "无明显优势景观", min: 5, max: 7 }
    ],
    "配套": [
      { id: "A5", label: "政府/文化/医疗核心", min: 5, max: 10 },
      { id: "B4", label: "成熟社区配套", min: 5, max: 10 },
      { id: "C4", label: "生活配套需提升", min: 5, max: 9 },
      { id: "D4", label: "生活配套匮乏", min: 5, max: 8 }
    ]
  },
  
  // 房屋状况评估配置
  condition: {
    "交付": [
      { id: "A1", label: "交付标准（全新精装）", min: 35, max: 40 },
      { id: "B1", label: "交付标准（良好装修）", min: 25, max: 35 },
      { id: "C1", label: "交付标准（普通装修）", min: 15, max: 25 },
      { id: "D1", label: "交付标准（毛坯/老旧）", min: 10, max: 15 }
    ],
    "维护": [
      { id: "A2", label: "维护状况（无磨损）", min: 25, max: 30 },
      { id: "B2", label: "维护状况（轻微磨损）", min: 20, max: 25 },
      { id: "C2", label: "维护状况（较多问题）", min: 15, max: 20 },
      { id: "D2", label: "维护状况（严重问题）", min: 15, max: 20 }
    ],
    "附加": [
      { id: "A3", label: "附加价值（智能家居等）", min: 20, max: 30 },
      { id: "B3", label: "附加价值（部分家具）", min: 10, max: 15 },
      { id: "C3", label: "附加价值（无额外）", min: 5, max: 10 },
      { id: "D3", label: "附加价值（无价值）", min: 5, max: 10 }
    ]
  },
  
  // 楼龄评估配置
  buildingAge: {
    "楼龄": [
      { id: "A1", label: "0-5年", min: 95, max: 100 },
      { id: "B1", label: "5-10年", min: 90, max: 94 },
      { id: "C1", label: "10-15年", min: 80, max: 89 },
      { id: "D1", label: "15-20年", min: 70, max: 79 },
      { id: "E1", label: "20-25年", min: 60, max: 69 },
      { id: "F1", label: "25-30年", min: 50, max: 59 },
      { id: "G1", label: "30-40年", min: 40, max: 49 },
      { id: "H1", label: "40年以上", min: 30, max: 39 }
    ]
  },
  
  // 户型与朝向评估配置
  layout: {
    "户型": [
      { id: "A1", label: "户型方正与实用性", min: 30, max: 35 },
      { id: "B1", label: "户型基本合理", min: 25, max: 30 },
      { id: "C1", label: "户型存在缺陷", min: 15, max: 25 },
      { id: "D1", label: "户型严重不合理", min: 10, max: 15 }
    ],
    "通透性": [
      { id: "A2", label: "南北通透性", min: 30, max: 35 },
      { id: "B2", label: "多数房间朝南/部分通透", min: 25, max: 30 },
      { id: "C2", label: "单面采光/通风一般", min: 15, max: 25 },
      { id: "D2", label: "全北或全西/通风差", min: 10, max: 15 }
    ],
    "采光": [
      { id: "A3", label: "采光与景观", min: 20, max: 25 },
      { id: "B3", label: "采光良好/视野一般", min: 15, max: 20 },
      { id: "C3", label: "采光或视野受限", min: 10, max: 15 },
      { id: "D3", label: "严重遮挡", min: 5, max: 10 }
    ],
    "私密性": [
      { id: "A4", label: "私密性好", min: 5, max: 10 },
      { id: "B4", label: "私密性尚可", min: 5, max: 9 },
      { id: "C4", label: "私密性不足", min: 5, max: 8 },
      { id: "D4", label: "私密性差", min: 5, max: 9 }
    ]
  },
  
  // 周边配套评估配置
  surrounding: {
    "商业": [
      { id: "A1", label: "商业购物（步行5-10分钟）", min: 25, max: 30 },
      { id: "B1", label: "商业购物（步行10-15分钟）", min: 20, max: 25 },
      { id: "C1", label: "商业购物（不便）", min: 15, max: 20 },
      { id: "D1", label: "商业购物（几乎无）", min: 10, max: 15 }
    ],
    "教育": [
      { id: "A2", label: "教育资源（步行15分钟）", min: 20, max: 25 },
      { id: "B2", label: "教育资源（步行15-20分钟）", min: 15, max: 20 },
      { id: "C2", label: "教育资源（通勤时间长）", min: 10, max: 15 },
      { id: "D2", label: "教育资源（跨区上学）", min: 10, max: 15 }
    ],
    "医疗": [
      { id: "A3", label: "医疗服务（步行10分钟）", min: 15, max: 20 },
      { id: "B3", label: "医疗服务（车程15-20分钟）", min: 10, max: 15 },
      { id: "C3", label: "医疗服务（通勤时间长）", min: 5, max: 10 },
      { id: "D3", label: "医疗服务（非常不便）", min: 5, max: 8 }
    ],
    "娱乐": [
      { id: "A4", label: "休闲娱乐（步行10分钟）", min: 15, max: 20 },
      { id: "B4", label: "休闲娱乐（车程15分钟）", min: 10, max: 15 },
      { id: "C4", label: "休闲娱乐（缺乏）", min: 5, max: 10 },
      { id: "D4", label: "休闲娱乐（完全无）", min: 5, max: 8 }
    ],
    "生活": [
      { id: "A5", label: "生活服务（步行5分钟）", min: 10, max: 15 },
      { id: "B5", label: "生活服务（步行10分钟）", min: 5, max: 10 },
      { id: "C5", label: "生活服务（选择少）", min: 5, max: 8 },
      { id: "D5", label: "生活服务（无法满足）", min: 5, max: 7 }
    ]
  }
};