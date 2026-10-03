// legal_knowledge_and_types.js
// Egyptian Prosecution & Judicial Evidence Management - Standards, Codes, and Legal Rule Engine

export const ITEM_TYPE_CODES = {
  'مخدرات': 'DRG',
  'مصوغات': 'JWL',
  'أموال': 'CUR',
  'أسلحة وذخائر': 'WPN',
  'سيارات': 'VEH',
  'هواتف محمولة': 'PHN',
  'أجهزة حاسب آلي ولابتوب': 'COM',
  'أحراز تموينية': 'FOD',
  'مستندات وأوراق رسمية': 'DOC',
  'أخرى': 'GEN'
};

export function getItemTypeCode(itemType) {
  if (!itemType) return 'GEN';
  const t = itemType.trim();
  if (t.includes('مخدر')) return 'DRG';
  if (t.includes('مصوغ') || t.includes('ذهب') || t.includes('فض') || t.includes('ألماس')) return 'JWL';
  if (t.includes('أموال') || t.includes('مبالغ') || t.includes('نقد') || t.includes('عملة')) return 'CUR';
  if (t.includes('سلاح') || t.includes('أسلح') || t.includes('ذخير')) return 'WPN';
  if (t.includes('سيار') || t.includes('مركب')) return 'VEH';
  if (t.includes('هاتف') || t.includes('محمول') || t.includes('موبايل')) return 'PHN';
  if (t.includes('حاسب') || t.includes('لابتوب') || t.includes('كمبيوتر')) return 'COM';
  if (t.includes('تموين') || t.includes('سلع')) return 'FOD';
  if (t.includes('مستند') || t.includes('ورق')) return 'DOC';
  return 'GEN';
}

export function generateEvidenceNumber(itemType, existingEvidences = []) {
  const currentYear = new Date().getFullYear();
  const typeCode = getItemTypeCode(itemType);
  const prefix = `EG-${currentYear}-${typeCode}-`;
  
  let maxSeq = 0;
  if (Array.isArray(existingEvidences)) {
    existingEvidences.forEach(e => {
      if (e.evidenceNumber && e.evidenceNumber.startsWith(prefix)) {
        const parts = e.evidenceNumber.split('-');
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    });
    if (maxSeq === 0) {
      maxSeq = existingEvidences.filter(e => getItemTypeCode(e.itemType) === typeCode).length;
    }
  }
  
  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `EG-${currentYear}-${typeCode}-${nextSeq}`;
}

// Local Egyptian Legal Knowledge Engine for Seizures & Evidence
export const EGYPTIAN_JUDICIAL_LEGAL_KNOWLEDGE = {
  laws: [
    {
      title: "قانون الإجراءات الجنائية رقم 150 لسنة 1950 (المواد 77 إلى 109)",
      summary: "ينظم سلطة مأموري الضبط القضائي والنيابة العامة في ضبط وتحريز الأوراق والأسلحة والآلات والمبالغ النقدية الناتجة عن الجريمة أو المستعملة فيها، ووضع الأختام عليها، وقواعد رد الأشياء لأصحابها أو بيعها بالمزاد العلني أو مصادرتها للخزانة العامة.",
      articles: [
        { num: "المادة 77", text: "يضبط مأمور الضبط القضائي جميع الأوراق والأسلحة والآلات وكل ما يحتمل أن يكون قد استعمل في ارتكاب الجريمة أو نتج عن ارتكابها أو ما وقعت عليه الجريمة." },
        { num: "المادة 85", text: "توضع الأشياء والأوراق المضبوطة في حرز مغلق وتربط كلما أمكن وتختم ويوقع عليها مأمور الضبط القضائي مع بيان تاريخ التحريز ومحضر الضبط." },
        { num: "المادة 101", text: "يجوز للنيابة العامة أو القاضي الجزئي الأمر ببيع الأشياء المضبوطة التي يخشى تلفها بمرور الزمن أو يستلزم حفظها نفقات تستغرق قيمتها، وتودع حصيلة البيع خزانة المحكمة أو النيابة لحساب ذوي الشأن." },
        { num: "المادة 102", text: "ترد الأشياء المضبوطة إلى من كانت في حيازته وقت ضبطها، إلا إذا كانت محلاً لجريمة أو نتجت عنها فيكون الرد لمن سلبت منه بوجه غير مشروع." },
        { num: "المادة 107", text: "تصبح المضبوطات التي لا يطلبها أصحابها في الميعاد ملكاً للحكومة بغير حاجة إلى حكم يقضي بذلك بعد مضي 3 سنوات من تاريخ انتهاء الدعوى الجنائية." }
      ]
    },
    {
      title: "التعليمات العامة للنيابة العامة بشأن حفظ وتصرفات الأحراز (الكتاب الدوري)",
      summary: "توجب قيد جميع الأحراز بسجل خاص، وتعيين أمين للمخزن مسؤول شخصياً عنها، وحظر التصرف فيها إلا بأمر كتابي صريح من عضو النيابة المختص. وتوريد العملات الأجنبية فوراً للبنك المركزي، وفحص المشغولات الذهبية بمصلحة الدمغة والموازين.",
      rules: [
        "إعدام المواد المخدرة والسموم بمعرفة لجنة قضائية مشكلة برئاسة رئيس نيابة ومندوب من وزارة الصحة ومصلحة مكافحة المخدرات بموجب محضر رسمي معتمد.",
        "بيع السيارات والمركبات المحجوزة بالمزاد العلني بمعرفة الهيئة العامة للخدمات الحكومية وتوريد الثمن لحساب النيابة العامة بعد صدور قرار قضائي نهائي.",
        "توريد العملات الأجنبية المضبوطة لحساب النيابة العامة بالبنك المركزي المصري ولا يجوز حفظها بخزائن النيابات الجزئية لأكثر من 48 ساعة.",
        "فحص وتحديد عيار ووزن المصوغات والمعادن الثمينة بمعرفة مصلحة دمغ المصوغات والموازين الرسمية."
      ]
    },
    {
      title: "قانون مكافحة المخدرات رقم 182 لسنة 1960 وتعديلاته",
      summary: "يلزم أخذ عينات كافية من المضبوطات وإرسالها للمعمل الكيماوي بمصلحة الطب الشرعي، وحفظ الكمية المتبقية بمخزن النيابة المؤمن حتى الفصل النهائي في الدعوى، ثم إعدامها بالحرق بأفران مخصصة بحضور اللجنة الثلاثية."
    },
    {
      title: "قانون البنك المركزي والجهاز المصرفي رقم 194 لسنة 2020",
      summary: "ينظم التعامل في النقد الأجنبي، وحظر التعامل بغير الطرق المصرفية المعتمدة، وضبط المبالغ المهربة أو المزيفة وتوريدها للبنك المركزي."
    }
  ]
};
