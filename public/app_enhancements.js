// app_enhancements.js - Complete Judicial Enhancements Engine

// 1. CODING STANDARD: EG-YYYY-CODE-XXXX
const ITEM_TYPE_CODES_MAP = {
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

function getItemTypeCode(itemType) {
  if (!itemType) return 'GEN';
  const t = String(itemType).trim();
  if (t.includes('مخدر')) return 'DRG';
  if (t.includes('مصوغ') || t.includes('ذهب') || t.includes('فض') || t.includes('ألماس')) return 'JWL';
  if (t.includes('أموال') || t.includes('مبالغ') || t.includes('نقد') || t.includes('عمل')) return 'CUR';
  if (t.includes('سلاح') || t.includes('أسلح') || t.includes('ذخير')) return 'WPN';
  if (t.includes('سيار') || t.includes('مركب')) return 'VEH';
  if (t.includes('هاتف') || t.includes('محمول')) return 'PHN';
  if (t.includes('حاسب') || t.includes('لابتوب') || t.includes('كمبيوتر')) return 'COM';
  if (t.includes('تموين') || t.includes('سلع')) return 'FOD';
  if (t.includes('مستند') || t.includes('ورق')) return 'DOC';
  return 'GEN';
}

function generateEvidenceNumber(itemType) {
  const currentYear = new Date().getFullYear();
  const typeCode = getItemTypeCode(itemType);
  const prefix = `EG-${currentYear}-${typeCode}-`;
  
  let allEvs = (typeof evidences !== 'undefined' && Array.isArray(evidences)) ? evidences : [];
  if (allEvs.length === 0) {
    try {
      const raw = localStorage.getItem('judicial_evidences_data_v1');
      if (raw) allEvs = JSON.parse(raw);
    } catch(e) {}
  }

  let maxSeq = 0;
  if (Array.isArray(allEvs)) {
    allEvs.forEach(e => {
      if (e.evidenceNumber && e.evidenceNumber.startsWith(prefix)) {
        const parts = e.evidenceNumber.split('-');
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
    if (maxSeq === 0) {
      maxSeq = allEvs.filter(e => getItemTypeCode(e.itemType) === typeCode).length;
    }
  }
  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `EG-${currentYear}-${typeCode}-${nextSeq}`;
}

// 2. DYNAMIC INPUTS FOR NEW EVIDENCE FORM
function updateLiveBarcodePreview(code, typeCode, typeLabel) {
  const badge = document.getElementById('currentTypeCodeBadge');
  if (badge) {
    if (typeCode && typeLabel) {
      badge.textContent = `${typeCode} (${typeLabel})`;
    } else if (typeCode) {
      badge.textContent = typeCode;
    }
  }
  const container = document.getElementById('newEvidenceBarcodeContainer');
  if (container) {
    container.innerHTML = `<svg id="newEvidenceLiveBarcodeSvg" style="width: 100%; max-width: 100%; height: 55px; display: block; margin: 0 auto;"></svg>`;
  }
  const cleanCode = (code || '').trim();
  if (cleanCode && typeof renderBarcodeSafely === 'function') {
    renderBarcodeSafely('#newEvidenceLiveBarcodeSvg', cleanCode, 2.0, 44);
  }
}

function handleItemTypeChange() {
  const sel = document.getElementById('itemTypeSelect');
  if (!sel) return;
  let val = sel.value;
  if (val === 'أخرى') {
    const customVal = document.getElementById('customItemTypeInput')?.value.trim();
    if (customVal) val = customVal;
  }

  const customCont = document.getElementById('customItemTypeContainer');
  const vehicleCont = document.getElementById('vehicleDetailsContainer');
  const jewelryCont = document.getElementById('jewelryDetailsContainer');
  const moneyCont = document.getElementById('moneyDetailsContainer');
  const foodCont = document.getElementById('foodSupplyDetailsContainer');
  const weaponCont = document.getElementById('weaponsDetailsContainer');
  const phoneCont = document.getElementById('phoneDetailsContainer');

  if (customCont) customCont.style.display = (sel.value === 'أخرى') ? 'block' : 'none';
  if (vehicleCont) {
    const isVeh = val.includes('سيار') || val.includes('مركب') || sel.value === 'سيارات';
    vehicleCont.style.display = isVeh ? 'block' : 'none';
  }
  if (jewelryCont) {
    const isJwl = sel.value === 'مصوغات' || val.includes('مصوغ') || val.includes('ذهب') || val.includes('فض') || val.includes('ألماس');
    jewelryCont.style.display = isJwl ? 'block' : 'none';
  }
  if (moneyCont) {
    const isMoney = sel.value === 'أموال' || val.includes('أموال') || val.includes('مبالغ') || val.includes('نقد') || val.includes('عمل');
    moneyCont.style.display = isMoney ? 'block' : 'none';
  }
  if (foodCont) {
    const isFood = sel.value === 'أحراز تموينية' || sel.value === 'سلع تموينية' || val.includes('تموين') || val.includes('سلع') || val.includes('أغذية') || val.includes('أطعمة');
    foodCont.style.display = isFood ? 'block' : 'none';
  }
  if (weaponCont) {
    const isWpn = sel.value === 'أسلحة وذخائر' || val.includes('سلاح') || val.includes('ذخير') || val.includes('أسلحة');
    weaponCont.style.display = isWpn ? 'block' : 'none';
  }
  if (phoneCont) {
    const isPhn = sel.value === 'هواتف محمولة' || val.includes('هاتف') || val.includes('موبايل') || val.includes('جوال');
    phoneCont.style.display = isPhn ? 'block' : 'none';
  }

  // Automatically regenerate evidence number with official standard and update barcode
  const newCode = generateEvidenceNumber(val);
  const evInput = document.getElementById('evidenceNumberInput');
  if (evInput) {
    evInput.value = newCode;
  }

  const typeCode = getItemTypeCode(val);
  updateLiveBarcodePreview(newCode, typeCode, sel.value);
}

function handleCustomItemTypeInput(customVal) {
  if (!customVal) return;
  handleItemTypeChange();
}

function handleEvidenceNumberManualInput(manualVal) {
  if (!manualVal) return;
  const sel = document.getElementById('itemTypeSelect');
  const typeCode = getItemTypeCode(sel ? sel.value : '');
  updateLiveBarcodePreview(manualVal.trim(), typeCode, sel ? sel.value : '');
}

function handleMoneyCurrencyChange() {
  const sel = document.getElementById('moneyCurrencySelect');
  if (!sel) return;
  const curr = sel.value;
  const rateBox = document.getElementById('exchangeRateContainer');
  const calcBox = document.getElementById('calculatedEgpContainer');

  if (curr !== 'جنيه مصري') {
    if (rateBox) rateBox.style.display = 'block';
    if (calcBox) calcBox.style.display = 'block';
  } else {
    if (rateBox) rateBox.style.display = 'none';
    if (calcBox) calcBox.style.display = 'none';
  }
  calculateTotalEgpEquivalent();
}

function calculateTotalEgpEquivalent() {
  const amtInp = document.getElementById('moneyAmountInput');
  const currSel = document.getElementById('moneyCurrencySelect');
  const rateInp = document.getElementById('moneyExchangeRateInput');
  const display = document.getElementById('moneyCalculatedEgpDisplay');

  if (!amtInp || !currSel || !display) return;
  const amt = parseFloat(amtInp.value) || 0;
  const curr = currSel.value;

  if (curr === 'جنيه مصري') {
    display.value = amt.toLocaleString('ar-EG') + ' ج.م';
  } else {
    const rate = parseFloat(rateInp ? rateInp.value : 1) || 1;
    const total = amt * rate;
    display.value = total.toLocaleString('ar-EG', { maximumFractionDigits: 2 }) + ' ج.م (تقريبي)';
  }
}

function calculateModalEditMoneyEgp() {
  const amt = parseFloat(document.getElementById('modalEditMoneyAmount')?.value) || 0;
  const curr = (document.getElementById('modalEditMoneyCurrency')?.value || '').trim();
  const rate = parseFloat(document.getElementById('modalEditMoneyExchangeRate')?.value) || 1;
  const disp = document.getElementById('modalEditMoneyEgpDisplay');
  if (!disp) return;

  if (curr === 'جنيه مصري' || !curr) {
    disp.value = amt.toLocaleString('ar-EG') + ' ج.م';
  } else {
    disp.value = (amt * rate).toLocaleString('ar-EG', { maximumFractionDigits: 2 }) + ' ج.م';
  }
}

function toggleEditModalVehicleFields() {
  const val = (document.getElementById('modalEditItemType')?.value || '').trim();
  const isVeh = val.includes('سيار') || val.includes('مركب');
  const isJwl = val.includes('مصوغ') || val.includes('ذهب') || val.includes('فض') || val.includes('ألماس');
  const isCur = val.includes('أموال') || val.includes('مبالغ') || val.includes('نقد') || val.includes('عمل');

  const vehCont = document.getElementById('modalEditVehicleContainer');
  const jwlCont = document.getElementById('modalEditJewelryContainer');
  const curCont = document.getElementById('modalEditMoneyContainer');

  if (vehCont) vehCont.style.display = isVeh ? 'block' : 'none';
  if (jwlCont) jwlCont.style.display = isJwl ? 'block' : 'none';
  if (curCont) curCont.style.display = isCur ? 'block' : 'none';
}

// 3. PREVIEW EVIDENCE MODAL
let activePreviewEvidence = null;

function openPreviewModal(id) {
  const ev = (typeof evidences !== 'undefined') ? evidences.find(e => e.id === id) : null;
  if (!ev) {
    if (typeof showToast === 'function') showToast('تعذر العثور على بيانات الحرز', true);
    return;
  }
  activePreviewEvidence = ev;
  window.activeEvidenceForPreview = ev;

  document.getElementById('previewModalSubtitle').textContent = `${ev.partialProsecution || ev.totalProsecution || 'النيابة العامة'} • قضية ${ev.caseNumber}`;

  let specsHtml = '';
  // Check Jewelry
  if (ev.itemType === 'مصوغات' || ev.jewelryMetal || ev.jewelryWeight) {
    specsHtml += `
      <div style="background:#fffdf5; border:1.5px solid #d97706; border-radius:10px; padding:14px; margin-top:14px;">
        <h4 style="color:#b45309; font-size:14px; margin-bottom:10px;"><i class="fa-solid fa-gem"></i> مواصفات المصوغات والمعادن الثمينة</h4>
        <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); font-size:13px;">
          <div><strong>المعدن والنوع:</strong> ${escapeHtml(ev.jewelryMetal || 'مشغولات ذهبية')}</div>
          <div><strong>الوزن الصافي:</strong> ${escapeHtml(ev.jewelryWeight ? ev.jewelryWeight + ' جرام' : '-')}</div>
          <div><strong>القطع والوصف:</strong> ${escapeHtml(ev.jewelryPieces || '-')}</div>
          <div><strong>العيار والدمغات:</strong> ${escapeHtml(ev.jewelryKarat || 'مدموغ رسمي')}</div>
          <div><strong>القيمة التقديرية:</strong> <span style="font-weight:800; color:#15803d;">${ev.jewelryEstimatedValue ? Number(ev.jewelryEstimatedValue).toLocaleString('ar-EG') + ' ج.م' : '-'}</span></div>
          <div class="form-group-full"><strong>تقرير الفحص:</strong> ${escapeHtml(ev.jewelryReport || 'تم الفحص بمعرفة خبير الصاغة')}</div>
        </div>
      </div>
    `;
  }
  // Check Money
  if (ev.itemType === 'أموال' || ev.moneyAmount || ev.moneyCurrency) {
    const isForeign = ev.moneyCurrency && ev.moneyCurrency !== 'جنيه مصري';
    specsHtml += `
      <div style="background:#f0fdf4; border:1.5px solid #16a34a; border-radius:10px; padding:14px; margin-top:14px;">
        <h4 style="color:#15803d; font-size:14px; margin-bottom:10px;"><i class="fa-solid fa-coins"></i> تفاصيل المبالغ النقدية والعملات</h4>
        <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); font-size:13px;">
          <div><strong>المبلغ المضبوط:</strong> <span style="font-size:16px; font-weight:900; color:#15803d;">${Number(ev.moneyAmount || 0).toLocaleString('ar-EG')}</span></div>
          <div><strong>نوع العملة:</strong> <strong>${escapeHtml(ev.moneyCurrency || 'جنيه مصري')}</strong></div>
          ${isForeign ? `<div><strong>سعر الصرف:</strong> ${ev.moneyExchangeRate || '-'} ج.م</div>` : ''}
          ${isForeign ? `<div><strong>المعادل بالجنيه:</strong> <span style="font-weight:900; color:#0f172a;">${(Number(ev.moneyAmount || 0) * Number(ev.moneyExchangeRate || 1)).toLocaleString('ar-EG')} ج.م</span></div>` : ''}
          <div><strong>جهة الإيداع:</strong> ${escapeHtml(ev.moneyDepositEntity || 'خزينة النيابة العامة')}</div>
          <div class="form-group-full"><strong>الفئات والأرقام:</strong> ${escapeHtml(ev.moneyDenominations || '-')}</div>
        </div>
      </div>
    `;
  }
  // Check Vehicle
  if (ev.carPlateNumber || ev.carBrandModel || ev.carChassisNumber) {
    specsHtml += `
      <div style="background:#f8fafc; border:1.5px solid #38bdf8; border-radius:10px; padding:14px; margin-top:14px;">
        <h4 style="color:#0284c7; font-size:14px; margin-bottom:10px;"><i class="fa-solid fa-car"></i> مواصفات وبيانات المركبة</h4>
        <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); font-size:13px;">
          <div><strong>اللوحات:</strong> ${escapeHtml(ev.carPlateNumber || '-')}</div>
          <div><strong>الماركة والموديل:</strong> ${escapeHtml(ev.carBrandModel || '-')}</div>
          <div><strong>رقم الشاسيه:</strong> <code style="font-family:monospace;">${escapeHtml(ev.carChassisNumber || '-')}</code></div>
          <div><strong>رقم الموتور:</strong> ${escapeHtml(ev.carMotorNumber || '-')}</div>
          <div><strong>اللون وسنة الصنع:</strong> ${escapeHtml(ev.carColor || '-')} (${escapeHtml(ev.carYear || '-')})</div>
          <div class="form-group-full"><strong>حالة السيارة والتلفيات:</strong> ${escapeHtml(ev.carCondition || '-')}</div>
        </div>
      </div>
    `;
  }

  // Photos Gallery
  let photosHtml = '';
  if (ev.images && Array.isArray(ev.images) && ev.images.length > 0) {
    photosHtml = `
      <div style="margin-top:16px;">
        <h4 style="font-size:13.5px; font-weight:800; color:#0f172a; margin-bottom:8px;"><i class="fa-solid fa-camera"></i> التوثيق الفوتوغرافي للحرز (${ev.images.length} صور):</h4>
        <div class="image-thumbnails-grid" style="display:flex; gap:10px; flex-wrap:wrap;">
          ${ev.images.map((img, i) => `
            <div style="width:110px; height:85px; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1; cursor:pointer;" onclick="openLightbox('${img.dataUrl}', '${escapeHtml(img.name || 'صورة الحرز')}')">
              <img src="${img.dataUrl}" alt="${escapeHtml(img.name)}" style="width:100%; height:100%; object-fit:cover;">
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Timeline
  let timelineHtml = '';
  if (ev.history && Array.isArray(ev.history) && ev.history.length > 0) {
    timelineHtml = `
      <div style="margin-top:20px;">
        <h4 style="font-size:13.5px; font-weight:800; color:#0f172a; margin-bottom:8px;"><i class="fa-solid fa-timeline"></i> سلسلة الحيازة والإجراءات القضائية المتخذة:</h4>
        <div class="table-responsive">
          <table class="official-table" style="font-size:12px;">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>نوع الإجراء</th>
                <th>الحالة</th>
                <th>القائم به</th>
                <th>السند</th>
                <th>البيان والتفاصيل</th>
              </tr>
            </thead>
            <tbody>
              ${ev.history.map(h => `
                <tr>
                  <td>${escapeHtml(h.date || '-')}</td>
                  <td><strong>${escapeHtml(h.actionType || '-')}</strong></td>
                  <td><span class="badge ${h.status === 'في المخزن' ? 'badge-in-custody' : 'badge-lab'}">${escapeHtml(h.status || '-')}</span></td>
                  <td>${escapeHtml(h.performedBy || '-')}</td>
                  <td>${escapeHtml(h.docRef || '-')}</td>
                  <td>${escapeHtml(h.details || '-')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  const seizureDateObj = new Date(ev.seizureDate || ev.createdAt || new Date());
  const diffDaysSeizure = Math.floor((new Date() - seizureDateObj) / (1000 * 60 * 60 * 24));
  const isOverThreeYears = diffDaysSeizure >= (3 * 365) && (ev.status === 'في المخزن' || ev.status === 'مرسل للمعمل الجنائي' || ev.status === 'قيد الانتظار');

  const container = document.getElementById('previewEvidenceModalBody');
  container.innerHTML = `
    ${isOverThreeYears ? `
      <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; color: #991b1b; display: flex; align-items: flex-start; gap: 10px;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 22px; color: #dc2626; margin-top: 2px; flex-shrink: 0;"></i>
        <div>
          <strong style="font-size: 13.5px; display: block; margin-bottom: 3px;">تنبيه قضائي ملزم - تجاوز المدة القانونية (أكثر من 3 سنوات بالمستودع):</strong>
          <div style="font-size: 12.5px; line-height: 1.6;">ملاحظة هامة: مضى على تحريز هذا الحرز أكثر من 3 سنوات بالمستودع دون تصرف نهائي، ويتعين المبادرة بالعرض على النيابة المختصة لتقرير مصيره وفقاً للتعليمات القضائية والقانونية المنظمة.</div>
        </div>
      </div>
    ` : ''}

    <!-- Top Barcode & Header -->
    <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; text-align:center; margin-bottom:14px;">
      <svg id="previewBarcodeSvg"></svg>
    </div>

    <!-- Official Details Card -->
    <div class="details-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap:12px; font-size:13px; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
      <div><strong>رقم الحرز:</strong> <span style="font-weight:900; color:#0f172a; font-size:15px;">${escapeHtml(ev.evidenceNumber)}</span></div>
      <div><strong>رقم القضية:</strong> <span style="font-weight:700; color:#0284c7;">${escapeHtml(ev.caseNumber)}</span></div>
      <div><strong>نيابة الاستئناف:</strong> ${escapeHtml(ev.appealProsecution || '-')}</div>
      <div><strong>النيابة الجزئية / الكلية:</strong> ${escapeHtml(ev.partialProsecution || ev.totalProsecution || '-')}</div>
      <div><strong>نوع الحرز:</strong> <span class="badge-item-type">${escapeHtml(ev.itemType || '-')}</span></div>
      <div><strong>نوع القضية:</strong> ${escapeHtml(ev.caseType || '-')}</div>
      <div><strong>تاريخ الضبط:</strong> ${escapeHtml(ev.seizureDate || '-')}</div>
      <div><strong>قسم الشرطة:</strong> ${escapeHtml(ev.policeStation || '-')}</div>
      <div><strong>جهة الضبط:</strong> ${escapeHtml(ev.seizingAuthority || '-')}</div>
      <div><strong>مكان الحفظ:</strong> <strong>${escapeHtml(ev.storageLocation || '-')}</strong></div>
      <div><strong>علاقة المتهم:</strong> ${escapeHtml(ev.defendantRelation || 'حائز المضبوطات')}</div>
      <div><strong>الحالة الراهنة:</strong> <span class="badge ${ev.status === 'في المخزن' ? 'badge-in-custody' : 'badge-lab'}">${escapeHtml(ev.status)}</span></div>
      <div class="form-group-full" style="grid-column: 1 / -1; margin-top:6px; border-top:1px dashed #cbd5e1; padding-top:8px;">
        <strong>الوصف التفصيلي للحرز:</strong>
        <div style="margin-top:4px; color:#334155; line-height:1.6;">${escapeHtml(ev.description || 'لا يوجد وصف تفصيلي')}</div>
      </div>
    </div>

    ${specsHtml}
    ${photosHtml}
    ${timelineHtml}
  `;

  // Render barcode
  setTimeout(() => {
    if (typeof renderBarcodeSafely === 'function') {
      renderBarcodeSafely('#previewBarcodeSvg', ev.evidenceNumber, 2, 45);
    }
  }, 50);

  // Edit button visibility
  const editBtn = document.getElementById('previewEditBtn');
  if (editBtn) {
    const isAdmin = currentUser && currentUser.role === 'admin';
    editBtn.style.display = isAdmin ? 'inline-flex' : 'none';
  }

  // Show vehicle placard ONLY for vehicles, and thermal sticker ONLY for non-vehicles
  const isVeh = (typeof isVehicleEvidence === 'function') 
    ? isVehicleEvidence(ev) 
    : (ev.itemType && (ev.itemType.includes('سيار') || ev.itemType.includes('مركب')));
  const prevStickerBtn = document.getElementById('previewBtnThermalSticker');
  const prevPlacardBtn = document.getElementById('previewBtnVehiclePlacard');
  if (prevPlacardBtn) prevPlacardBtn.style.display = isVeh ? 'inline-flex' : 'none';
  if (prevStickerBtn) prevStickerBtn.style.display = isVeh ? 'none' : 'inline-flex';

  openModal('previewEvidenceModal');
}

function printFromPreviewModal() {
  if (!activePreviewEvidence) return;
  closeModal('previewEvidenceModal');
  openDetailsModal(activePreviewEvidence.id);
  setTimeout(() => {
    if (typeof printActiveModalReport === 'function') printActiveModalReport();
  }, 200);
}

function goToProcedureFromPreview() {
  if (!activePreviewEvidence) return;
  const evId = activePreviewEvidence.id;
  closeModal('previewEvidenceModal');
  quickOpenProcedureForEvidence(evId);
}

function goToEditFromPreview() {
  if (!activePreviewEvidence) return;
  const evId = activePreviewEvidence.id;
  closeModal('previewEvidenceModal');
  openEditModal(evId);
}

// 4. JUDICIAL PROCEDURES MANAGEMENT
let activeProcedureEvidenceId = null;

function initProceduresDropdown(filterText = '') {
  const sel = document.getElementById('procedureEvidenceSelect');
  if (!sel || typeof getUserAccessibleEvidences !== 'function') return;

  const accessible = getUserAccessibleEvidences();
  const q = String(filterText || '').trim().toLowerCase();
  const filtered = q ? accessible.filter(e => 
    e.evidenceNumber.toLowerCase().includes(q) || 
    e.caseNumber.toLowerCase().includes(q) ||
    (e.description && e.description.toLowerCase().includes(q))
  ) : accessible;

  sel.innerHTML = '<option value="">-- اختر حرزاً لاتخاذ إجراء بشأنه (' + filtered.length + ' حرز) --</option>' +
    filtered.map(e => `
      <option value="${e.id}">${escapeHtml(e.evidenceNumber)} | قضية: ${escapeHtml(e.caseNumber)} | ${escapeHtml(e.itemType)} | (${escapeHtml(e.status)})</option>
    `).join('');
}

function filterProcedureDropdown(val) {
  initProceduresDropdown(val);
}

function quickOpenProcedureForEvidence(evidenceId) {
  switchTab('procedures');
  setTimeout(() => {
    switchProcedureSubTab('new');
    handleSelectProcedureEvidence(evidenceId);
  }, 100);
}

function handleSelectProcedureEvidence(evidenceId) {
  activeProcedureEvidenceId = evidenceId;
  const banner = document.getElementById('procedureEvidenceBanner');
  const form = document.getElementById('procedureExecutionForm');
  const historyCard = document.getElementById('procedureHistoryCard');

  if (!evidenceId) {
    if (banner) banner.style.display = 'none';
    if (form) form.style.display = 'none';
    if (historyCard) historyCard.style.display = 'none';
    return;
  }

  const ev = evidences.find(e => e.id === evidenceId);
  if (!ev) return;

  if (banner) banner.style.display = 'block';
  if (form) form.style.display = 'block';
  if (historyCard) historyCard.style.display = 'block';

  document.getElementById('procedureBannerCode').textContent = ev.evidenceNumber;
  document.getElementById('procedureBannerCase').textContent = 'قضية: ' + ev.caseNumber;
  document.getElementById('procedureBannerStatus').textContent = ev.status;
  document.getElementById('procedureBannerType').textContent = ev.itemType || '-';
  document.getElementById('procedureBannerPros').textContent = ev.partialProsecution || ev.totalProsecution || '-';
  document.getElementById('procedureBannerLocation').textContent = ev.storageLocation || '-';
  document.getElementById('procedureBannerDate').textContent = ev.seizureDate || '-';
  document.getElementById('procedureBannerDesc').textContent = ev.description || '-';

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const decDate = document.getElementById('procedureDecisionDateInput');
  const execDate = document.getElementById('procedureExecutionDateInput');
  if (decDate) decDate.value = today;
  if (execDate) execDate.value = today;

  const authInp = document.getElementById('procedureJudicialAuthorityInput');
  if (authInp) authInp.value = ev.partialProsecution || 'النيابة العامة';

  const commInp = document.getElementById('procedureCommitteeInput');
  if (commInp) commInp.value = 'المستشار رئيس النيابة، أمين المخزن، ضابط المباحث';

  handleProcedureActionTypeChange();
  renderProcedureHistoryTable(ev);
}

function handleProcedureActionTypeChange() {
  const sel = document.getElementById('procedureActionTypeSelect');
  if (!sel) return;
  const val = sel.value;

  const saleBox = document.getElementById('procedureSaleContainer');
  const interiorBox = document.getElementById('procedureInteriorContainer');
  const destBox = document.getElementById('procedureDestructionContainer');
  const deliBox = document.getElementById('procedureDeliveryContainer');

  if (saleBox) saleBox.style.display = (val.includes('بيع') || val.includes('مزاد')) ? 'block' : 'none';
  if (interiorBox) interiorBox.style.display = (val.includes('الداخلية') || val.includes('شرطة')) ? 'block' : 'none';
  if (destBox) destBox.style.display = (val.includes('إعدام') || val.includes('إتلاف')) ? 'block' : 'none';
  if (deliBox) deliBox.style.display = (val.includes('تسليم للمجني') || val.includes('مالكه')) ? 'block' : 'none';
}

function renderProcedureHistoryTable(ev) {
  const tbody = document.getElementById('procedureHistoryTableBody');
  if (!tbody) return;
  const history = (ev && Array.isArray(ev.history)) ? ev.history : [];

  if (history.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:15px; color:#64748b;">لا توجد إجراءات سابقة مسجلة على هذا الحرز</td></tr>';
    return;
  }

  tbody.innerHTML = history.map(h => `
    <tr>
      <td>${escapeHtml(h.date || '-')}</td>
      <td><strong>${escapeHtml(h.actionType || '-')}</strong></td>
      <td><span class="badge ${h.status === 'في المخزن' ? 'badge-in-custody' : 'badge-lab'}">${escapeHtml(h.status || '-')}</span></td>
      <td>${escapeHtml(h.performedBy || '-')}</td>
      <td>${escapeHtml(h.docRef || '-')}</td>
      <td style="max-width:280px; word-break:break-word;">
        <div>${escapeHtml(h.details || '-')}</div>
        ${h.electronicPaymentNumber ? `<div style="font-size:11px; color:#0284c7; font-weight:bold; margin-top:2px;"><i class="fa-solid fa-credit-card"></i> مدفوعة: ${escapeHtml(h.electronicPaymentNumber)}</div>` : ''}
        ${h.transferNumber ? `<div style="font-size:11px; color:#15803d; font-weight:bold; margin-top:2px;"><i class="fa-solid fa-money-bill-transfer"></i> تحويل: ${escapeHtml(h.transferNumber)} (${escapeHtml(h.settlementAccount || 'الخزانة')})</div>` : ''}
        ${h.interiorRepName ? `<div style="font-size:11px; color:#1e40af; font-weight:bold; margin-top:2px;"><i class="fa-solid fa-user-shield"></i> مستلم الداخلية: ${escapeHtml(h.interiorRepName)} (${escapeHtml(h.interiorRepRank || '')})</div>` : ''}
      </td>
      <td style="text-align:center; white-space:nowrap;">
        <div style="display:flex; gap:4px; justify-content:center;">
          <button type="button" class="btn-sm" style="background:#e0f2fe; color:#0369a1; padding:3px 7px; font-size:11px;" onclick="editProcedureDecision('${ev.id}', '${h.id}')" title="تعديل بيانات القرار">
            <i class="fa-solid fa-pen-to-square"></i> تعديل
          </button>
          <button type="button" class="btn-sm" style="background:#fee2e2; color:#b91c1c; padding:3px 7px; font-size:11px;" onclick="cancelProcedureDecision('${ev.id}', '${h.id}')" title="إلغاء القرار واسترجاع الحالة">
            <i class="fa-solid fa-trash-arrow-up"></i> إلغاء
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function handleExecuteProcedureSubmit(event) {
  event.preventDefault();
  if (!activeProcedureEvidenceId) {
    showToast('يرجى اختيار وتحديد حرز أولاً', true);
    return;
  }
  const ev = (typeof evidences !== 'undefined') ? evidences.find(e => e.id === activeProcedureEvidenceId) : null;
  if (!ev) return;

  const actionType = document.getElementById('procedureActionTypeSelect').value;
  const decNum = document.getElementById('procedureDecisionNumberInput').value.trim();
  const decDate = document.getElementById('procedureDecisionDateInput').value;
  const execDate = document.getElementById('procedureExecutionDateInput').value;
  const authority = document.getElementById('procedureJudicialAuthorityInput').value.trim();
  const committee = document.getElementById('procedureCommitteeInput').value.trim();
  const memo = document.getElementById('procedureDetailsMemo').value.trim();

  // Determine new status
  let newStatus = 'في المخزن';
  if (actionType.includes('بيع بالمزاد')) newStatus = 'تم البيع';
  else if (actionType.includes('الداخلية') || actionType.includes('تسليم الحرز إلى وزارة الداخلية')) newStatus = 'تم التسليم للداخلية';
  else if (actionType.includes('إعدام') || actionType.includes('إتلاف')) newStatus = 'تم الإعدام بمحضر رسمي';
  else if (actionType.includes('تسليم للمجني') || actionType.includes('مالكه')) newStatus = 'تم التسليم لصاحب الشأن';
  else if (actionType.includes('مصادرة')) newStatus = 'محفوظ بصفة نهائية';
  else if (actionType.includes('معمل') || actionType.includes('طب شرعي')) newStatus = 'مرسل للمعمل الجنائي';
  else if (actionType.includes('مركزي') || actionType.includes('خزينة النيابة')) newStatus = 'تم التسليم للنيابة';
  else if (actionType.includes('دمغة')) newStatus = 'قيد الفحص القضائي';
  else if (actionType.includes('إعادة للمخزن')) newStatus = 'في المخزن';

  // Specific details
  let extraDetails = '';
  let saleAmt = null;
  let rcptNum = '';
  let ePayNum = '';
  let beneficiary = '';
  let settlementAcct = '';
  let transferNum = '';
  let settlementDate = '';

  let interiorEntity = '';
  let interiorRepName = '';
  let interiorRepRank = '';
  let interiorRepId = '';
  let interiorDocRef = '';
  let interiorMinute = '';

  let destMethod = '';
  let destMinute = '';

  let recName = '';
  let recId = '';

  if (actionType.includes('بيع بالمزاد') || actionType.includes('بيع')) {
    saleAmt = document.getElementById('procedureSaleAmountInput')?.value;
    rcptNum = document.getElementById('procedureReceiptNumberInput')?.value.trim() || '';
    ePayNum = document.getElementById('procedureElectronicPaymentNumberInput')?.value.trim() || '';
    beneficiary = document.getElementById('procedureBeneficiaryEntityInput')?.value.trim() || '';
    settlementAcct = document.getElementById('procedureSettlementAccountSelect')?.value || 'الخزانة العامة للدولة';
    transferNum = document.getElementById('procedureTransferNumberInput')?.value.trim() || '';
    settlementDate = document.getElementById('procedureSettlementDateInput')?.value || '';

    if (saleAmt) extraDetails += ` - حصيلة البيع: (${Number(saleAmt).toLocaleString('ar-EG')} ج.م)`;
    if (ePayNum) extraDetails += ` - مدفوعة إلكترونية: (${ePayNum})`;
    if (beneficiary) extraDetails += ` - لصالح: (${beneficiary})`;
    if (settlementAcct) extraDetails += ` - بيان تسوية: (${settlementAcct})`;
    if (transferNum) extraDetails += ` - أمر دفع: (${transferNum})`;
    if (rcptNum) extraDetails += ` - إيصال: (${rcptNum})`;
  } else if (actionType.includes('الداخلية') || actionType.includes('تسليم الحرز إلى وزارة الداخلية')) {
    interiorEntity = document.getElementById('procedureInteriorEntityInput')?.value.trim() || '';
    interiorRepName = document.getElementById('procedureInteriorRepNameInput')?.value.trim() || '';
    interiorRepRank = document.getElementById('procedureInteriorRepRankInput')?.value.trim() || '';
    interiorRepId = document.getElementById('procedureInteriorRepNationalIdInput')?.value.trim() || '';
    interiorDocRef = document.getElementById('procedureInteriorDocRefInput')?.value.trim() || '';
    interiorMinute = document.getElementById('procedureInteriorReceiptMinuteInput')?.value.trim() || '';

    if (interiorEntity) extraDetails += ` - قطاع الداخلية: (${interiorEntity})`;
    if (interiorRepName) extraDetails += ` - المندوب المستلم: (${interiorRepName}${interiorRepRank ? ' - ' + interiorRepRank : ''})`;
    if (interiorMinute) extraDetails += ` - محضر تسليم رقم: (${interiorMinute})`;
    if (interiorDocRef) extraDetails += ` - إشارة/خطاب: (${interiorDocRef})`;
  } else if (actionType.includes('إعدام') || actionType.includes('إتلاف')) {
    destMethod = document.getElementById('procedureDestructionMethodInput')?.value.trim() || '';
    destMinute = document.getElementById('procedureDestructionMinuteInput')?.value.trim() || '';
    if (destMethod) extraDetails += ` - طريقة الإتلاف: (${destMethod})`;
    if (destMinute) extraDetails += ` - محضر إعدام: (${destMinute})`;
  } else if (actionType.includes('تسليم للمجني') || actionType.includes('مالكه')) {
    recName = document.getElementById('procedureRecipientNameInput')?.value.trim() || '';
    recId = document.getElementById('procedureRecipientNationalIdInput')?.value.trim() || '';
    if (recName) extraDetails += ` - المستلم: (${recName})`;
    if (recId) extraDetails += ` - الرقم القومي: (${recId})`;
  }

  // Update Evidence
  ev.status = newStatus;
  ev.lastModified = `${execDate} (${actionType})`;
  if (!Array.isArray(ev.history)) ev.history = [];

  const historyEntry = {
    id: 'ACT-' + Date.now(),
    actionType: actionType,
    status: newStatus,
    date: execDate,
    performedBy: committee || (currentUser ? currentUser.name : 'اللجنة المشرفة'),
    docRef: `${authority} - قرار ${decNum}`,
    decisionNumber: decNum,
    decisionDate: decDate,
    judicialAuthority: authority,
    details: `${memo} ${extraDetails}`.trim(),
    saleAmount: saleAmt ? Number(saleAmt) : null,
    receiptNumber: rcptNum,
    electronicPaymentNumber: ePayNum,
    beneficiaryEntity: beneficiary,
    settlementAccount: settlementAcct,
    transferNumber: transferNum,
    settlementDate: settlementDate,
    interiorEntity: interiorEntity,
    interiorRepName: interiorRepName,
    interiorRepRank: interiorRepRank,
    interiorRepNationalId: interiorRepId,
    interiorDocRef: interiorDocRef,
    interiorReceiptMinute: interiorMinute,
    destructionMethod: destMethod,
    destructionMinute: destMinute,
    recipientName: recName,
    recipientNationalId: recId
  };

  ev.history.unshift(historyEntry);
  saveEvidencesToStorage();

  showToast(`تم اعتماد قرار (${actionType}) للحرز رقم (${ev.evidenceNumber}) بنجاح`);
  handleSelectProcedureEvidence(activeProcedureEvidenceId);
  renderAllExecutedProceduresTable();
  if (typeof updateDashboard === 'function') updateDashboard();
}

function printProcedureExecutionMinute() {
  if (!activeProcedureEvidenceId) {
    showToast('يرجى اختيار الحرز المراد طباعة محضره', true);
    return;
  }
  const ev = (typeof evidences !== 'undefined') ? evidences.find(e => e.id === activeProcedureEvidenceId) : null;
  if (!ev) return;

  const actionType = document.getElementById('procedureActionTypeSelect')?.value || 'إجراء قضائي';
  const decNum = document.getElementById('procedureDecisionNumberInput')?.value || '-';
  const execDate = document.getElementById('procedureExecutionDateInput')?.value || new Date().toISOString().split('T')[0];
  const committee = document.getElementById('procedureCommitteeInput')?.value || 'أمين المخزن وعضو النيابة';
  const memo = document.getElementById('procedureDetailsMemo')?.value || ev.description;

  const printArea = document.getElementById('printReportArea');
  if (printArea) {
    printArea.innerHTML = `
      <div style="font-family: 'Cairo', Tahoma, sans-serif; direction: rtl; padding: 25px; color: #000;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
          <div>جمهورية مصر العربية • النيابة العامة</div>
          <div style="font-weight: bold;">${escapeHtml(ev.partialProsecution || ev.totalProsecution || 'النيابة العامة')}</div>
          <div style="font-size: 18px; font-weight: bold; margin: 10px 0;">محضر تنفيذ قرار قضائي وتصرف في حرز</div>
        </div>
        <p>إنه في يوم <strong>${execDate}</strong>، وبناءً على القرار القضائي رقم <strong>(${escapeHtml(decNum)})</strong>، تم تنفيذ الإجراء الآتي بيانه على الحرز القضائي:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;">
          <tr><th style="width: 25%; border: 1px solid #000; padding: 8px 10px; text-align: right;">رقم الحرز:</th><td style="border: 1px solid #000; padding: 8px 10px;">${escapeHtml(ev.evidenceNumber)}</td><th style="width: 25%; border: 1px solid #000; padding: 8px 10px; text-align: right;">رقم القضية:</th><td style="border: 1px solid #000; padding: 8px 10px;">${escapeHtml(ev.caseNumber)}</td></tr>
          <tr><th style="border: 1px solid #000; padding: 8px 10px; text-align: right;">نوع الحرز:</th><td style="border: 1px solid #000; padding: 8px 10px;">${escapeHtml(ev.itemType)}</td><th style="border: 1px solid #000; padding: 8px 10px; text-align: right;">نوع القضية:</th><td style="border: 1px solid #000; padding: 8px 10px;">${escapeHtml(ev.caseType)}</td></tr>
          <tr><th style="border: 1px solid #000; padding: 8px 10px; text-align: right;">الإجراء المنفذ:</th><td colspan="3" style="border: 1px solid #000; padding: 8px 10px;"><strong>${escapeHtml(actionType)}</strong> (الحالة الناتجة: ${escapeHtml(ev.status)})</td></tr>
          <tr><th style="border: 1px solid #000; padding: 8px 10px; text-align: right;">لجنة التنفيذ:</th><td colspan="3" style="border: 1px solid #000; padding: 8px 10px;">${escapeHtml(committee)}</td></tr>
          <tr><th style="border: 1px solid #000; padding: 8px 10px; text-align: right;">تفاصيل وبيان التنفيذ:</th><td colspan="3" style="border: 1px solid #000; padding: 8px 10px;">${escapeHtml(memo)}</td></tr>
        </table>
        <div style="margin-top: 40px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 30%; font-size: 12px;">أمين مخزن الأحراز<br><br>................................</div>
          <div style="width: 30%; font-size: 12px;">عضو لجنة التنفيذ<br><br>................................</div>
          <div style="width: 30%; font-size: 12px;">رئيس النيابة / القاضي المشرف<br><br>................................</div>
        </div>
      </div>
    `;
    setTimeout(() => {
      window.print();
    }, 100);
    return;
  }

  const printWin = window.open('', '_blank');
  if (!printWin) {
    window.print();
    return;
  }
}

// 5. ADMIN DASHBOARD & CHARTS
function renderAdminDashboard() {
  if (!currentUser || currentUser.role !== 'admin') return;

  const accessible = getUserAccessibleEvidences();
  const totalCount = accessible.length;

  // KPIs
  document.getElementById('dashTotalEvidences').textContent = totalCount;
  document.getElementById('dashInCustody').textContent = accessible.filter(e => e.status === 'في المخزن').length;
  document.getElementById('dashInLab').textContent = accessible.filter(e => e.status === 'مرسل للمعمل الجنائي').length;
  document.getElementById('dashDisposed').textContent = accessible.filter(e => e.status === 'تم البيع' || e.status === 'تم الإعدام بمحضر رسمي' || e.status === 'تم التسليم لصاحب الشأن' || e.status === 'محفوظ بصفة نهائية').length;

  let totalActions = 0;
  accessible.forEach(e => {
    if (e.history && Array.isArray(e.history)) totalActions += e.history.length;
  });
  document.getElementById('dashTotalActions').textContent = totalActions;

  // Calculate total valuations (Money + Jewelry)
  let totalValuation = 0;
  let totalCashEgp = 0;
  let totalCashForeignConverted = 0;
  let totalJewelryVal = 0;
  let totalJewelryGrams = 0;

  accessible.forEach(e => {
    if (e.moneyAmount) {
      const amt = Number(e.moneyAmount) || 0;
      if (e.moneyCurrency === 'جنيه مصري' || !e.moneyCurrency) {
        totalCashEgp += amt;
        totalValuation += amt;
      } else {
        const rate = Number(e.moneyExchangeRate) || 1;
        const eq = amt * rate;
        totalCashForeignConverted += eq;
        totalValuation += eq;
      }
    }
    if (e.jewelryEstimatedValue) {
      const jv = Number(e.jewelryEstimatedValue) || 0;
      totalJewelryVal += jv;
      totalValuation += jv;
    }
    if (e.jewelryWeight) {
      totalJewelryGrams += Number(e.jewelryWeight) || 0;
    }
  });

  document.getElementById('dashTotalValuation').textContent = totalValuation.toLocaleString('ar-EG') + ' ج.م';

  // Classified Types Grid
  const typeCategories = [
    { name: 'مخدرات', code: 'DRG', icon: 'fa-tablets', color: '#dc2626' },
    { name: 'مصوغات', code: 'JWL', icon: 'fa-gem', color: '#d97706' },
    { name: 'أموال', code: 'CUR', icon: 'fa-money-bill-wave', color: '#16a34a' },
    { name: 'أسلحة وذخائر', code: 'WPN', icon: 'fa-gun', color: '#475569' },
    { name: 'سيارات', code: 'VEH', icon: 'fa-car-side', color: '#0284c7' },
    { name: 'هواتف محمولة', code: 'PHN', icon: 'fa-mobile-screen', color: '#7c3aed' },
    { name: 'أجهزة حاسب آلي ولابتوب', code: 'COM', icon: 'fa-laptop', color: '#0891b2' },
    { name: 'أحراز تموينية', code: 'FOD', icon: 'fa-wheat-awn', color: '#ca8a04' },
    { name: 'مستندات وأوراق رسمية', code: 'DOC', icon: 'fa-file-lines', color: '#2563eb' },
    { name: 'أخرى', code: 'GEN', icon: 'fa-boxes-stacked', color: '#64748b' }
  ];

  const grid = document.getElementById('dashClassifiedTypesGrid');
  if (grid) {
    grid.innerHTML = typeCategories.map(cat => {
      const count = accessible.filter(e => getItemTypeCode(e.itemType) === cat.code).length;
      const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : 0;
      return `
        <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:10px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.05); border-top: 3px solid ${cat.color};">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:30px; height:30px; border-radius:6px; background:${cat.color}15; color:${cat.color}; display:flex; align-items:center; justify-content:center; font-size:14px;">
                <i class="fa-solid ${cat.icon}"></i>
              </div>
              <strong style="font-size:13.5px; color:#0f172a;">${cat.name}</strong>
            </div>
            <span class="badge" style="background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; font-family:monospace; font-weight:800;">${cat.code}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:6px;">
            <span style="font-size:22px; font-weight:900; color:#0f172a;">${count}</span>
            <span style="font-size:12px; color:#64748b; font-weight:700;">${pct}% من الإجمالي</span>
          </div>
          <div style="width:100%; height:6px; background:#e2e8f0; border-radius:3px; margin-top:8px; overflow:hidden;">
            <div style="width:${pct}%; height:100%; background:${cat.color};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Procedures Chart
  const procChart = document.getElementById('dashProceduresBarChart');
  if (procChart) {
    const actionsMap = [
      { label: 'حفظ بالأمانات / المخزن', count: accessible.filter(e => e.status === 'في المخزن').length, color: '#0284c7' },
      { label: 'مرسل للمعمل الجنائي / الطب الشرعي', count: accessible.filter(e => e.status === 'مرسل للمعمل الجنائي').length, color: '#d97706' },
      { label: 'تم البيع بالمزاد العلني', count: accessible.filter(e => e.status === 'تم البيع').length, color: '#ca8a04' },
      { label: 'تم الإعدام بمحضر رسمي', count: accessible.filter(e => e.status === 'تم الإعدام بمحضر رسمي').length, color: '#dc2626' },
      { label: 'تم التسليم لأصحابه', count: accessible.filter(e => e.status.includes('تسليم')).length, color: '#16a34a' },
      { label: 'مصادرة نهائية للدولة', count: accessible.filter(e => e.status === 'محفوظ بصفة نهائية').length, color: '#475569' }
    ];

    procChart.innerHTML = actionsMap.map(a => {
      const p = totalCount > 0 ? ((a.count / totalCount) * 100).toFixed(1) : 0;
      return `
        <div>
          <div style="display:flex; justify-content:space-between; font-size:12.5px; font-weight:700; margin-bottom:4px;">
            <span>${a.label}</span>
            <span>${a.count} (${p}%)</span>
          </div>
          <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
            <div style="width:${p}%; height:100%; background:${a.color}; border-radius:4px;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Financial Portfolio
  const finPort = document.getElementById('dashFinancialPortfolio');
  if (finPort) {
    finPort.innerHTML = `
      <div style="padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
        <div style="color:#64748b; font-size:12px; margin-bottom:4px;">إجمالي المبالغ النقدية بالجنيه المصري (EGP):</div>
        <strong style="font-size:16px; color:#15803d;">${totalCashEgp.toLocaleString('ar-EG')} ج.م</strong>
      </div>
      <div style="padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
        <div style="color:#64748b; font-size:12px; margin-bottom:4px;">إجمالي العملات الأجنبية (المعادل بالجنيه بسعر الصرف):</div>
        <strong style="font-size:16px; color:#0284c7;">${totalCashForeignConverted.toLocaleString('ar-EG')} ج.م</strong>
      </div>
      <div style="padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
        <div style="color:#64748b; font-size:12px; margin-bottom:4px;">المصوغات الذهبية والمعادن الثمينة (الوزن والقيمة التقديرية):</div>
        <strong style="font-size:16px; color:#b45309;">${totalJewelryVal.toLocaleString('ar-EG')} ج.م</strong>
        <span style="font-size:12px; color:#64748b; margin-right:8px;">(إجمالي الوزن: ${totalJewelryGrams.toFixed(2)} جرام)</span>
      </div>
    `;
  }
}

function printAdminDashboardReportLegacy() {
  const accessible = (typeof getUserAccessibleEvidences === 'function') ? getUserAccessibleEvidences() : (typeof evidences !== 'undefined' ? evidences : []);
  const totalCount = accessible.length;
  const inCustody = accessible.filter(e => e.status === 'في المخزن').length;
  const inLab = accessible.filter(e => e.status === 'مرسل للمعمل الجنائي').length;
  const sold = accessible.filter(e => e.status === 'تم البيع').length;
  const destroyed = accessible.filter(e => e.status === 'تم الإعدام بمحضر رسمي').length;
  const delivered = accessible.filter(e => e.status && e.status.includes('تسليم')).length;

  let totalCashEgp = 0;
  let totalCashForeign = 0;
  let totalJewelryVal = 0;
  let totalJewelryGrams = 0;
  let totalValuation = 0;

  accessible.forEach(e => {
    if (e.moneyAmount) {
      const amt = Number(e.moneyAmount) || 0;
      if (e.moneyCurrency === 'جنيه مصري' || !e.moneyCurrency) {
        totalCashEgp += amt;
        totalValuation += amt;
      } else {
        const rate = Number(e.moneyExchangeRate) || 1;
        const converted = amt * rate;
        totalCashForeign += converted;
        totalValuation += converted;
      }
    }
    if (e.jewelryEstimatedValue) {
      const jv = Number(e.jewelryEstimatedValue) || 0;
      totalJewelryVal += jv;
      totalValuation += jv;
    }
    if (e.jewelryWeight) {
      totalJewelryGrams += Number(e.jewelryWeight) || 0;
    }
  });

  const typeCategories = [
    { name: 'مخدرات', code: 'DRG' },
    { name: 'مصوغات', code: 'JWL' },
    { name: 'أموال', code: 'CUR' },
    { name: 'أسلحة وذخائر', code: 'WPN' },
    { name: 'سيارات', code: 'VEH' },
    { name: 'هواتف محمولة', code: 'PHN' },
    { name: 'أجهزة حاسب آلي ولابتوب', code: 'COM' },
    { name: 'أحراز تموينية', code: 'FOD' },
    { name: 'مستندات وأوراق رسمية', code: 'DOC' },
    { name: 'أخرى', code: 'GEN' }
  ];

  const printDate = new Date().toLocaleString('ar-EG');
  const printUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.name : 'مدير المنظومة';
  const printPros = (typeof currentUser !== 'undefined' && currentUser) ? (currentUser.partialProsecution || currentUser.totalProsecution || currentUser.appealProsecution || 'النيابة العامة') : 'النيابة العامة';
  const refNum = `REP-ADM-${Date.now().toString().slice(-6)}`;

  const printArea = document.getElementById('printReportArea');
  if (!printArea) {
    window.print();
    return;
  }

  printArea.innerHTML = `
    <div style="font-family: 'Cairo', Tahoma, sans-serif; direction: rtl; color: #000; padding: 10px;">
      <!-- Header -->
      <div style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 12px; font-weight: bold; line-height: 1.5;">
          جمهورية مصر العربية<br>
          النيابة العامة<br>
          ${escapeHtml(printPros)}
        </div>
        <div style="text-align: center;">
          <h1 style="font-size: 17px; font-weight: 900; margin: 0 0 4px 0;">التقرير الرقابي الشامل وإحصاءات منظومة المضبوطات</h1>
          <p style="font-size: 11px; font-weight: bold; margin: 0; color: #333;">SUPERVISORY & AUDIT EVIDENCE REPORT</p>
        </div>
        <div style="text-align: left; font-size: 11px; line-height: 1.5;">
          <strong>تاريخ الاستخراج:</strong> ${printDate}<br>
          <strong>المسؤول المستخرج:</strong> ${escapeHtml(printUser)}<br>
          <strong>رقم التقرير:</strong> ${refNum}
        </div>
      </div>

      <!-- KPIs Summary Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11.5px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #000; padding: 6px; text-align: center;">إجمالي الأحراز</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: center;">بالأمانات / المخزن</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: center;">بالمعمل الجنائي</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: center;">تم البيع بالمزاد</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: center;">تم الإعدام بمحضر</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: center;">تم التسليم لأصحابه</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: center;">القيمة التقديرية الإجمالية</th>
          </tr>
        </thead>
        <tbody>
          <tr style="font-weight: bold; text-align: center;">
            <td style="border: 1px solid #000; padding: 8px;">${totalCount} حرز</td>
            <td style="border: 1px solid #000; padding: 8px;">${inCustody}</td>
            <td style="border: 1px solid #000; padding: 8px;">${inLab}</td>
            <td style="border: 1px solid #000; padding: 8px;">${sold}</td>
            <td style="border: 1px solid #000; padding: 8px;">${destroyed}</td>
            <td style="border: 1px solid #000; padding: 8px;">${delivered}</td>
            <td style="border: 1px solid #000; padding: 8px; font-size: 12.5px;">${totalValuation.toLocaleString('ar-EG')} ج.م</td>
          </tr>
        </tbody>
      </table>

      <!-- Financial Portfolio Box -->
      <div style="border: 1px solid #000; padding: 8px 12px; margin-bottom: 14px; background: #fafafa; font-size: 11.5px; line-height: 1.6;">
        <div style="font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid #ddd; padding-bottom: 2px;">
          المحفظة المالية والمضبوطات النقدية والمصوغات:
        </div>
        <div style="display: flex; justify-content: space-between; gap: 10px;">
          <div><strong>النقد بالجنيه المصري:</strong> ${totalCashEgp.toLocaleString('ar-EG')} ج.م</div>
          <div><strong>العملات الأجنبية (المعادل بالجنيه):</strong> ${totalCashForeign.toLocaleString('ar-EG')} ج.م</div>
          <div><strong>المصوغات الذهبية:</strong> ${totalJewelryVal.toLocaleString('ar-EG')} ج.م (وزن: ${totalJewelryGrams.toFixed(2)} جم)</div>
        </div>
      </div>

      <!-- Classified Evidence Types Table -->
      <div style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">تصنيف وتحليل أنواع المضبوطات وفق التكويد المعتمد (EG-YYYY-CODE-XXXX):</div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #000; padding: 5px; width: 40px; text-align: center;">م</th>
            <th style="border: 1px solid #000; padding: 5px; text-align: right;">نوع الحرز والمضبوطات</th>
            <th style="border: 1px solid #000; padding: 5px; width: 100px; text-align: center;">الكود المعتمد</th>
            <th style="border: 1px solid #000; padding: 5px; width: 90px; text-align: center;">العدد المقيد</th>
            <th style="border: 1px solid #000; padding: 5px; width: 90px; text-align: center;">النسبة المئوية</th>
          </tr>
        </thead>
        <tbody>
          ${typeCategories.map((cat, idx) => {
            const count = accessible.filter(e => getItemTypeCode(e.itemType) === cat.code).length;
            const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : 0;
            return `
              <tr>
                <td style="border: 1px solid #000; padding: 4px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${cat.name}</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center; font-family: monospace; font-weight: bold;">${cat.code}</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${count}</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center;">${pct}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Evidences Detailed Inventory Table -->
      <div style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">بيان كشف الأحراز المسجلة بالمنظومة:</div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10.5px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #000; padding: 4px; width: 30px; text-align: center;">م</th>
            <th style="border: 1px solid #000; padding: 4px; width: 130px; text-align: center;">رقم الحرز</th>
            <th style="border: 1px solid #000; padding: 4px; width: 130px; text-align: center;">رقم القضية</th>
            <th style="border: 1px solid #000; padding: 4px; text-align: right;">النيابة المختصة</th>
            <th style="border: 1px solid #000; padding: 4px; width: 80px; text-align: center;">نوع الحرز</th>
            <th style="border: 1px solid #000; padding: 4px; width: 80px; text-align: center;">تاريخ الضبط</th>
            <th style="border: 1px solid #000; padding: 4px; width: 90px; text-align: center;">مكان الحفظ</th>
            <th style="border: 1px solid #000; padding: 4px; width: 110px; text-align: center;">الحالة الراهنة</th>
          </tr>
        </thead>
        <tbody>
          ${accessible.map((ev, i) => `
            <tr>
              <td style="border: 1px solid #000; padding: 3px; text-align: center;">${i + 1}</td>
              <td style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">${escapeHtml(ev.evidenceNumber)}</td>
              <td style="border: 1px solid #000; padding: 3px; text-align: center;">${escapeHtml(ev.caseNumber)}</td>
              <td style="border: 1px solid #000; padding: 3px;">${escapeHtml(ev.partialProsecution || ev.totalProsecution || '-')}</td>
              <td style="border: 1px solid #000; padding: 3px; text-align: center;">${escapeHtml(ev.itemType || '-')}</td>
              <td style="border: 1px solid #000; padding: 3px; text-align: center;">${escapeHtml(ev.seizureDate || '-')}</td>
              <td style="border: 1px solid #000; padding: 3px; text-align: center;">${escapeHtml(ev.storageLocation || '-')}</td>
              <td style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">${escapeHtml(ev.status || '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Signatures Footer -->
      <div style="margin-top: 30px; display: flex; justify-content: space-between; text-align: center; page-break-inside: avoid; font-size: 11px;">
        <div style="width: 30%; line-height: 1.8;">
          <strong>أمين عام مستودع الأحراز</strong><br><br>
          .........................................
        </div>
        <div style="width: 30%; line-height: 1.8;">
          <strong>عضو التفتيش والرقابة القضائية</strong><br><br>
          .........................................
        </div>
        <div style="width: 30%; line-height: 1.8;">
          <strong>المستشار رئيس النيابة / المحامي العام</strong><br><br>
          .........................................
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    window.print();
  }, 100);
}

// 6. ADMIN PERSONAL AI JUDICIAL ASSISTANT (100% LOCAL & OFFLINE)
function askAdminAI(questionText) {
  const inp = document.getElementById('adminAIInput');
  if (inp) {
    inp.value = questionText;
    handleAdminAISubmit(new Event('submit'));
  }
}

function clearAdminAIChat() {
  const log = document.getElementById('adminAIChatLog');
  if (!log) return;
  log.innerHTML = `
    <div class="ai-msg ai-msg-bot">
      <div class="ai-avatar"><i class="fa-solid fa-scale-balanced"></i></div>
      <div class="ai-bubble">
        <p>تم تفريغ المحادثة. يمكنك طرح أي سؤال قانوني أو إحصائي جديد حول منظومة الأحراز وسأجيبك فوراً.</p>
      </div>
    </div>
  `;
}

function handleAdminAISubmit(event) {
  if (event && event.preventDefault) event.preventDefault();
  const inp = document.getElementById('adminAIInput');
  if (!inp) return;
  const userText = inp.value.trim();
  if (!userText) return;

  const log = document.getElementById('adminAIChatLog');
  if (!log) return;

  // Append user message
  const userDiv = document.createElement('div');
  userDiv.className = 'ai-msg ai-msg-user';
  userDiv.innerHTML = `
    <div class="ai-avatar"><i class="fa-solid fa-user"></i></div>
    <div class="ai-bubble"><p>${escapeHtml(userText)}</p></div>
  `;
  log.appendChild(userDiv);
  inp.value = '';

  // Process Query Locally
  setTimeout(() => {
    const replyHtml = processLocalAIQuery(userText);
    const botDiv = document.createElement('div');
    botDiv.className = 'ai-msg ai-msg-bot';
    botDiv.innerHTML = `
      <div class="ai-avatar"><i class="fa-solid fa-scale-balanced"></i></div>
      <div class="ai-bubble">${replyHtml}</div>
    `;
    log.appendChild(botDiv);
    log.scrollTop = log.scrollHeight;
  }, 150);
}

function processLocalAIQuery(q) {
  const text = q.toLowerCase();
  const accessible = (typeof getUserAccessibleEvidences === 'function') ? getUserAccessibleEvidences() : [];

  // Check 1: System Statistics or Counts
  if (text.includes('إحصائي') || text.includes('احصائي') || text.includes('عدد الأحراز') || text.includes('كم عدد')) {
    const total = accessible.length;
    const inCustody = accessible.filter(e => e.status === 'في المخزن').length;
    const inLab = accessible.filter(e => e.status === 'مرسل للمعمل الجنائي').length;
    const sold = accessible.filter(e => e.status === 'تم البيع').length;
    const destroyed = accessible.filter(e => e.status === 'تم الإعدام بمحضر رسمي').length;

    return `
      <p><strong>الإحصائية الفورية للأحراز المسجلة بالمنظومة:</strong></p>
      <ul>
        <li>إجمالي الأحراز المسجلة: <strong>${total} حرز</strong></li>
        <li>الأحراز في المخزن / الأمانات: <strong>${inCustody}</strong></li>
        <li>الأحراز قيد الفحص بالمعمل الجنائي: <strong>${inLab}</strong></li>
        <li>الأحراز المباعة بالمزاد العلني: <strong>${sold}</strong></li>
        <li>الأحراز التي تم إعدامها رسمياً: <strong>${destroyed}</strong></li>
      </ul>
      <p>التكويد المعتمد يبدأ بالرمز الرسمي <code>EG-[السنة]-[الكود]-[الرقم]</code> ومصنف بدقة.</p>
    `;
  }

  // Check 2: Money or Currency or Jewelry
  if (text.includes('مبالغ') || text.includes('أموال') || text.includes('عملات') || text.includes('ذهب') || text.includes('مصوغات') || text.includes('دولار')) {
    let moneyCount = 0;
    let totalEgp = 0;
    let foreignList = [];
    let jewelryCount = 0;
    let totalJewelryVal = 0;

    accessible.forEach(e => {
      if (e.moneyAmount) {
        moneyCount++;
        const amt = Number(e.moneyAmount) || 0;
        if (e.moneyCurrency === 'جنيه مصري' || !e.moneyCurrency) {
          totalEgp += amt;
        } else {
          const rate = Number(e.moneyExchangeRate) || 1;
          const converted = amt * rate;
          totalEgp += converted;
          foreignList.push(`${amt.toLocaleString()} ${e.moneyCurrency} (تعادل ${converted.toLocaleString()} ج.م)`);
        }
      }
      if (e.itemType === 'مصوغات' || e.jewelryEstimatedValue) {
        jewelryCount++;
        totalJewelryVal += Number(e.jewelryEstimatedValue) || 0;
      }
    });

    return `
      <p><strong>الموقف المالي الشامل للمضبوطات النقدية والمصوغات:</strong></p>
      <ul>
        <li>عدد قضايا المضبوطات النقدية: <strong>${moneyCount} قضايا</strong></li>
        <li>إجمالي القيمة التقديرية بالجنيه المصري: <strong>${totalEgp.toLocaleString('ar-EG')} ج.م</strong></li>
        ${foreignList.length > 0 ? `<li>العملات الأجنبية المضبوطة: <br>• ${foreignList.join('<br>• ')}</li>` : ''}
        <li>عدد أحراز المصوغات والمعادن الثمينة: <strong>${jewelryCount} حرز</strong> بقيمة تقديرية <strong>${totalJewelryVal.toLocaleString('ar-EG')} ج.م</strong></li>
      </ul>
      <p><em>سند قانوني:</em> المادة 126 من قانون البنك المركزي رقم 194 لسنة 2020، وقانون الرقابة على المعادن الثمينة رقم 68 لسنة 1976 توجب توريد العملات الأجنبية للبنك المركزي وفحص المشغولات بمصلحة الدمغة والموازين.</p>
    `;
  }

  // Check 3: Legal Rule on Auction Sale
  if (text.includes('مزاد') || text.includes('بيع') || text.includes('سند قانوني لبيع')) {
    return `
      <p><strong>السند القانوني والإجراءات لبيع المضبوطات بالمزاد العلني:</strong></p>
      <ol>
        <li><strong>المادة 101 من قانون الإجراءات الجنائية رقم 150 لسنة 1950:</strong> تنص على أنه <em>"يجوز للنيابة العامة أو القاضي الجزئي الأمر ببيع الأشياء المضبوطة التي يخشى تلفها بمرور الزمن أو يستلزم حفظها نفقات تستغرق قيمتها، وتودع حصيلة البيع خزانة المحكمة أو النيابة لحساب ذوي الشأن"</em>.</li>
        <li><strong>الكتاب الدوري للنيابة العامة:</strong> توكل مهمة بيع السيارات والمركبات والبضائع للهيئة العامة للخدمات الحكومية لإجراء المزاد وفقاً لأحكام قانون التعاقدات الحكومية رقم 182 لسنة 2018.</li>
        <li><strong>التوريد المالي:</strong> يحرر إيصال توريد 33 ع.ح وتودع الحصيلة بحساب أمانات النيابة العامة لحين الفصل النهائي في الدعوى الجنائية.</li>
      </ol>
    `;
  }

  // Check 4: Legal Rule on Destruction of Narcotics
  if (text.includes('إعدام') || text.includes('مخدر') || text.includes('سموم') || text.includes('حرق')) {
    return `
      <p><strong>شروط وإجراءات تشكيل لجنة إعدام المواد المخدرة:</strong></p>
      <ol>
        <li><strong>قانون مكافحة المخدرات رقم 182 لسنة 1960:</strong> يتم التحريز وتؤخذ عينات كافية ترسل للمعمل الكيماوي بالطب الشرعي للتحليل.</li>
        <li><strong>قرار الإعدام:</strong> يصدر من المحامي العام الأول أو بقرار قضائي نهائي بعد صدور حكم بات أو انقضاء الدعوى.</li>
        <li><strong>تشكيل اللجنة الثلاثية الرسمية:</strong>
          <ul>
            <li>رئيس اللجنة: أحد السادة أعضاء النيابة العامة (رئيس نيابة على الأقل).</li>
            <li>عضو فني: مندوب من وزارة الصحة ومصلحة الطب الشرعي.</li>
            <li>عضو أمني: ضابط من الإدارة العامة لمكافحة المخدرات أو المباحث.</li>
          </ul>
        </li>
        <li><strong>التنفيذ:</strong> يتم الحرق بأفران الصهر المعتمدة التابعة لوزارة البيئة أو مصانع الحديد، ويحرر محضر إعدام رسمي مفصل يثبت فيه الأوزان والأنواع وتوقيعات أعضاء اللجنة.</li>
      </ol>
    `;
  }

  // Check 5: Returning Seizures to Owner
  if (text.includes('رد') || text.includes('تسليم') || text.includes('مالك') || text.includes('مجني')) {
    return `
      <p><strong>القواعد القانونية لرد وتسليم المضبوطات لأصحابها:</strong></p>
      <ul>
        <li><strong>المادة 102 من قانون الإجراءات الجنائية:</strong> <em>"رد الأشياء المضبوطة يكون إلى من كانت في حيازته وقت ضبطها، فإذا كانت المضبوطات من الأشياء التي وقعت عليها الجريمة أو المتحصلة منها، يكون ردها إلى من فقد حيازتها بالجريمة ما لم يكن لمن ضبطت معه حق في حبسها بمقتضى القانون"</em>.</li>
        <li><strong>شروط التسليم:</strong> إثبات الملكية بمستندات قاطعة (أصل الفاتورة، عقد مسجل، رخصة تسيير للمركبة)، والتأكد من عدم منازعة أي طرف آخر.</li>
        <li><strong>الاستلام:</strong> يحرر محضر تسليم رسمي موضحاً به الرقم القومي والصفة وتوقيع المستلم وأمين المخزن.</li>
      </ul>
    `;
  }

  // General Default Smart Judicial Reply
  return `
    <p>أهلاً بك سيادة المستشار. بخصوص استفسارك حول: <strong>"${escapeHtml(q)}"</strong>:</p>
    <p>وفقاً لأحكام <strong>قانون الإجراءات الجنائية رقم 150 لسنة 1950 (المواد 77 إلى 109)</strong> وتعليمات النيابة العامة:</p>
    <ul>
      <li>كافة المضبوطات مقيدة بنظام التكويد الرسمي <code>EG-[السنة]-[الكود]-[الرقم]</code> وتخضع لرقابة النيابة العامة المباشرة.</li>
      <li>لا يجوز تحريك أي حرز أو التصرف فيه بالبيع أو الإعدام أو التسليم إلا بقرار كتابي صريح من عضو النيابة المختص.</li>
      <li>يمكنك استخدام تبويب <strong>"القرارات والإجراءات القضائية"</strong> لقيد أي قرار بيع أو إعدام مع إصدار محضر التنفيذ الرسمي بضغطة زر.</li>
      <li>لأي إحصائيات فورية، يمكنك مراجعة شاشة <strong>"المتابعة والرقابة"</strong> المخصصة للإدارة فقط.</li>
    </ul>
  `;
}

// ============================================================================
// MODULE 1: THERMAL BARCODE LABELS & STICKERS (5×7 cm / 70×50 mm) & PLACARDS
// ============================================================================
function copyCurrentBarcodeNumber() {
  const evInput = document.getElementById('evidenceNumberInput');
  const val = evInput ? evInput.value.trim() : '';
  if (!val) {
    showToast('لا يوجد رقم حرز لنسخه', true);
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(val).then(() => {
      showToast(`تم نسخ رقم الحرز: ${val}`);
    }).catch(() => {
      showToast(`رقم الحرز: ${val}`);
    });
  } else {
    showToast(`رقم الحرز: ${val}`);
  }
}

function printNewEvidenceBarcodeSticker() {
  const evInput = document.getElementById('evidenceNumberInput');
  const caseInput = document.getElementById('caseNumberInput');
  const typeSel = document.getElementById('itemTypeSelect');
  const appealSel = document.getElementById('newAppealProsecutionSelect');
  const totalSel = document.getElementById('newTotalProsecutionSelect');
  const partialSel = document.getElementById('newPartialProsecutionSelect');
  const storageInput = document.getElementById('storageLocationInput');

  const evNum = evInput ? evInput.value.trim() : `EG-${new Date().getFullYear()}-GEN-0001`;
  const caseNum = caseInput ? caseInput.value.trim() : 'قيد التحقيق';
  const itemType = typeSel ? typeSel.value : 'مضبوطات عامة';
  const prosecution = (partialSel && partialSel.value) ? partialSel.value : ((totalSel && totalSel.value) ? totalSel.value : 'النيابة العامة');
  const storage = storageInput ? storageInput.value : 'مستودع الأحراز الرئيسي';

  const pseudoEvidence = {
    evidenceNumber: evNum,
    caseNumber: caseNum,
    itemType: itemType,
    partialProsecution: prosecution,
    storageLocation: storage,
    seizureDate: new Date().toISOString().split('T')[0],
    createdBy: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.username : 'موثق الأحراز'
  };

  printEvidenceThermalSticker(pseudoEvidence, 'thermal_5x7');
}

function printEvidenceThermalSticker(evidenceOrId, format = 'thermal_5x7') {
  let ev = evidenceOrId;
  if (typeof evidenceOrId === 'string') {
    const list = (typeof evidences !== 'undefined' && Array.isArray(evidences)) ? evidences : [];
    ev = list.find(e => e.id === evidenceOrId || e.evidenceNumber === evidenceOrId);
  }
  if (!ev) {
    ev = window.activeEvidenceForPreview || window.activeEvidenceForModal || (typeof activePreviewEvidence !== 'undefined' ? activePreviewEvidence : null);
  }
  if (!ev) {
    showToast('بيانات الحرز غير متوفرة للطباعة', true);
    return;
  }

  const svgBarcode = (typeof createCode128Svg === 'function') 
    ? createCode128Svg(ev.evidenceNumber, (format === 'vehicle_placard' ? 2.8 : 2.0), (format === 'vehicle_placard' ? 60 : 42), true)
    : `<div style="font-family:monospace; font-size:16px; font-weight:bold; letter-spacing:2px; border:1px solid #000; padding:6px;">* ${escapeHtml(ev.evidenceNumber)} *</div>`;

  const prosText = ev.partialProsecution || ev.totalProsecution || ev.appealProsecution || 'النيابة العامة';
  const dateText = ev.seizureDate || ev.createdAt || new Date().toISOString().split('T')[0];
  const userText = ev.createdBy || (typeof currentUser !== 'undefined' && currentUser ? currentUser.username : 'أمين العهدة');
  const typeCode = getItemTypeCode(ev.itemType);

  let printContent = '';

  if (format === 'vehicle_placard') {
    // Large vehicle windshield placard (A4/A5)
    printContent = `
      <div class="print-vehicle-placard" style="font-family:'Cairo', Tahoma, sans-serif; direction:rtl; text-align:right; border:4px double #000; padding:18px; margin:0 auto; max-width:680px; background:#fff;">
        <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:12px;">
          <h2 style="margin:0; font-size:18px;">جمهورية مصر العربية • النيابة العامة</h2>
          <h1 style="margin:4px 0; font-size:24px; font-weight:900;">لافتة مركبة / سيارة محجوزة قضائياً</h1>
          <div style="font-size:13px; font-weight:bold;">${escapeHtml(prosText)}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:8px 12px; border:1px solid #000; margin-bottom:12px;">
          <span style="font-size:15px; font-weight:900;">رقم الحرز: <span style="font-family:monospace; font-size:18px;">${escapeHtml(ev.evidenceNumber)}</span></span>
          <span style="font-size:15px; font-weight:900;">رقم القضية: ${escapeHtml(ev.caseNumber)}</span>
        </div>
        <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:13.5px;">
          <tr><td style="border:1px solid #000; padding:6px; width:28%; font-weight:bold;">رقم اللوحات:</td><td style="border:1px solid #000; padding:6px; font-size:16px; font-weight:900;">${escapeHtml(ev.carPlateNumber || 'بدون لوحات')}</td></tr>
          <tr><td style="border:1px solid #000; padding:6px; font-weight:bold;">الماركة والموديل:</td><td style="border:1px solid #000; padding:6px;">${escapeHtml(ev.carBrandModel || ev.description || '-')}</td></tr>
          <tr><td style="border:1px solid #000; padding:6px; font-weight:bold;">رقم الشاسيه / الموتور:</td><td style="border:1px solid #000; padding:6px; font-family:monospace;">شاسيه: ${escapeHtml(ev.carChassisNumber || '-')} / موتور: ${escapeHtml(ev.carMotorNumber || '-')}</td></tr>
          <tr><td style="border:1px solid #000; padding:6px; font-weight:bold;">موضع الحفظ الفعلي:</td><td style="border:1px solid #000; padding:6px;">${escapeHtml(ev.storageLocation || 'ساحة حجز المركبات')}</td></tr>
          <tr><td style="border:1px solid #000; padding:6px; font-weight:bold;">تاريخ التحريز والضبط:</td><td style="border:1px solid #000; padding:6px;">${escapeHtml(dateText)}</td></tr>
        </table>
        <div style="text-align:center; padding:10px 0; border:1.5px dashed #000; margin-bottom:12px; background:#fff;">
          ${svgBarcode}
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11.5px; border-top:1px solid #000; padding-top:6px;">
          <span>المحرر: ${escapeHtml(userText)}</span>
          <span>تنبيه: يحظر تحريك أو رفع المركبة إلا بقرار قضائي رسمي من النيابة العامة</span>
        </div>
      </div>
    `;
  } else {
    // Thermal 5x7 cm Sticker (Compact 70x50 mm)
    printContent = `
      <div class="thermal-sticker-5x7" style="font-family:'Cairo', Tahoma, sans-serif; direction:rtl; text-align:right; width:68mm; max-width:68mm; min-height:48mm; border:1.5px dashed #000; padding:4mm; box-sizing:border-box; background:#fff; margin:0 auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #000; padding-bottom:2px; margin-bottom:3px;">
          <div style="font-size:10px; font-weight:900;">النيابة العامة المصرية</div>
          <div style="font-size:9.5px; font-weight:bold; background:#000; color:#fff; padding:1px 4px; border-radius:3px;">${escapeHtml(typeCode)}</div>
        </div>
        <div style="font-size:11px; font-weight:900; margin-bottom:2px; display:flex; justify-content:space-between;">
          <span>حرز: <span style="font-family:monospace; font-size:11.5px;">${escapeHtml(ev.evidenceNumber)}</span></span>
          <span style="font-size:10px;">${escapeHtml(ev.caseType || '')}</span>
        </div>
        <div style="font-size:10px; margin-bottom:2px; display:flex; justify-content:space-between; font-weight:bold;">
          <span>قضية: ${escapeHtml(ev.caseNumber)}</span>
          <span>${escapeHtml(prosText)}</span>
        </div>
        <div style="font-size:9.5px; color:#222; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          <span><strong>النوع:</strong> ${escapeHtml(ev.itemType)} | <strong>المكان:</strong> ${escapeHtml(ev.storageLocation || 'المخزن')}</span>
        </div>
        <div style="text-align:center; margin:3px 0;">
          ${svgBarcode}
        </div>
        <div style="display:flex; justify-content:space-between; font-size:8.5px; color:#333; border-top:0.5px solid #666; padding-top:2px;">
          <span>التاريخ: ${escapeHtml(dateText)}</span>
          <span>الموثق: ${escapeHtml(userText)}</span>
        </div>
      </div>
    `;
  }

  // Populate #printReportArea for iframe-safe browser printing
  const printArea = document.getElementById('printReportArea');
  if (printArea) {
    printArea.innerHTML = printContent;
  }

  // Also try dedicated popup window
  const printWin = window.open('', '_blank', 'width=520,height=480');
  if (printWin) {
    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <title>ملصق استيكر الحرز - ${escapeHtml(ev.evidenceNumber)}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap">
        <style>
          @page { size: ${format === 'vehicle_placard' ? 'A4' : '70mm 50mm'}; margin: 1.5mm; }
          body { margin: 0; padding: 2mm; background: #fff; font-family: 'Cairo', Tahoma, sans-serif; }
          * { box-sizing: border-box; }
          svg { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `);
    printWin.document.close();
    setTimeout(() => {
      try {
        printWin.focus();
        printWin.print();
      } catch(e) {
        window.print();
      }
    }, 250);
  } else {
    // If popups blocked in iframe, print current page which now has #printReportArea active
    setTimeout(() => {
      window.print();
    }, 150);
  }
}

// ============================================================================
// MODULE 2: LIVE CAMERA BARCODE SCANNER (Webcam / Laptop / Mobile Camera)
// ============================================================================
let activeCameraStream = null;
let cameraScannerAnimationId = null;
let currentCameraFacingMode = 'environment';
let isTorchActive = false;
let barcodeDetectorInstance = null;
let isScannerPaused = false;
let scannerTargetContext = 'general'; // 'general' or 'inventory'

function playScanBeepSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    if (navigator.vibrate) navigator.vibrate(100);
  } catch (e) {}
}

function openLiveCameraScannerModal(context = 'general') {
  scannerTargetContext = context;
  isScannerPaused = false;
  const modal = document.getElementById('cameraBarcodeScannerModal');
  if (modal) modal.style.display = 'flex';

  const resultBox = document.getElementById('cameraScanResultBox');
  if (resultBox) resultBox.style.display = 'none';

  startCameraStream();
}

function closeLiveCameraScannerModal() {
  stopCameraStream();
  const modal = document.getElementById('cameraBarcodeScannerModal');
  if (modal) modal.style.display = 'none';
}

function startCameraStream() {
  const video = document.getElementById('cameraScannerVideo');
  if (!video) return;

  const statusEl = document.getElementById('cameraScannerStatusText');
  if (statusEl) statusEl.textContent = 'جاري تشغيل الكاميرا وتهيئة ماسح الباركود...';

  // Check BarcodeDetector native support
  if ('BarcodeDetector' in window && !barcodeDetectorInstance) {
    try {
      barcodeDetectorInstance = new BarcodeDetector({
        formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'upc_a']
      });
    } catch(e) {
      barcodeDetectorInstance = null;
    }
  }

  const constraints = {
    video: {
      facingMode: { ideal: currentCameraFacingMode },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      activeCameraStream = stream;
      video.srcObject = stream;
      video.setAttribute('playsinline', true);
      video.play();

      if (statusEl) statusEl.textContent = 'الكاميرا نشطة - وجّه الباركود داخل الإطار المضيء للمسح الفوري';

      // Start continuous scan loop
      runCameraScanLoop();
    })
    .catch(err => {
      console.warn('Camera access denied or unavailable:', err);
      if (statusEl) {
        statusEl.innerHTML = `
          <span style="color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> تعذر فتح الكاميرا مباشرة (${err.name || 'غير مدعوم'}).</span>
          <br>يمكنك رفع صورة للباركود من جهازك أو كتابة رقم الحرز يدوياً بالأسفل.
        `;
      }
    });
}

function stopCameraStream() {
  if (cameraScannerAnimationId) {
    cancelAnimationFrame(cameraScannerAnimationId);
    cameraScannerAnimationId = null;
  }
  if (activeCameraStream) {
    activeCameraStream.getTracks().forEach(track => track.stop());
    activeCameraStream = null;
  }
  const video = document.getElementById('cameraScannerVideo');
  if (video) video.srcObject = null;
}

function switchCameraFacingMode() {
  currentCameraFacingMode = (currentCameraFacingMode === 'environment') ? 'user' : 'environment';
  stopCameraStream();
  startCameraStream();
}

function toggleCameraTorch() {
  if (!activeCameraStream) return;
  const track = activeCameraStream.getVideoTracks()[0];
  if (!track) return;
  
  const capabilities = track.getCapabilities ? track.getCapabilities() : {};
  if (!capabilities.torch) {
    showToast('كشاف الإضاءة (Torch) غير مدعوم في هذه الكاميرا', true);
    return;
  }

  isTorchActive = !isTorchActive;
  track.applyConstraints({
    advanced: [{ torch: isTorchActive }]
  }).then(() => {
    const btn = document.getElementById('btnCameraTorch');
    if (btn) btn.style.background = isTorchActive ? '#c59b27' : 'rgba(255,255,255,0.2)';
    showToast(isTorchActive ? 'تم تشغيل الكشاف' : 'تم إيقاف الكشاف');
  }).catch(() => {
    showToast('تعذر التحكم في كشاف الكاميرا', true);
  });
}

function runCameraScanLoop() {
  if (isScannerPaused) return;

  const video = document.getElementById('cameraScannerVideo');
  if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
    cameraScannerAnimationId = requestAnimationFrame(runCameraScanLoop);
    return;
  }

  if (barcodeDetectorInstance) {
    barcodeDetectorInstance.detect(video)
      .then(barcodes => {
        if (barcodes && barcodes.length > 0 && !isScannerPaused) {
          const rawValue = barcodes[0].rawValue;
          if (rawValue) {
            handleDetectedBarcode(rawValue);
            return;
          }
        }
        cameraScannerAnimationId = requestAnimationFrame(runCameraScanLoop);
      })
      .catch(() => {
        cameraScannerAnimationId = requestAnimationFrame(runCameraScanLoop);
      });
  } else {
    // If native detector not available, loop continues while manual upload/input is available
    cameraScannerAnimationId = requestAnimationFrame(runCameraScanLoop);
  }
}

function handleImageFileUploadForBarcode(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      if ('BarcodeDetector' in window) {
        const detector = new BarcodeDetector({ formats: ['code_128', 'code_39', 'qr_code', 'ean_13'] });
        detector.detect(img).then(barcodes => {
          if (barcodes && barcodes.length > 0) {
            handleDetectedBarcode(barcodes[0].rawValue);
          } else {
            showToast('لم يتم العثور على باركود واضح في الصورة المرفوعة', true);
          }
        }).catch(() => {
          showToast('تعذر فحص الباركود من الصورة', true);
        });
      } else {
        showToast('جهازك لا يدعم فحص الصور الآلي، يرجى كتابة الرقم بالأسفل', true);
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleDetectedBarcode(scannedRaw) {
  if (!scannedRaw) return;
  isScannerPaused = true;
  playScanBeepSound();

  const code = scannedRaw.trim();
  const allEvs = (typeof evidences !== 'undefined' && Array.isArray(evidences)) ? evidences : [];
  
  // Try exact match or partial match on evidenceNumber or caseNumber
  const matched = allEvs.find(e => 
    (e.evidenceNumber && e.evidenceNumber.toLowerCase() === code.toLowerCase()) ||
    (e.evidenceNumber && e.evidenceNumber.replace(/-/g, '').toLowerCase() === code.replace(/-/g, '').toLowerCase()) ||
    (e.caseNumber && e.caseNumber.includes(code))
  );

  const resultBox = document.getElementById('cameraScanResultBox');
  if (!resultBox) return;
  resultBox.style.display = 'block';

  if (matched) {
    // If in Inventory Audit mode, mark it directly
    if (scannerTargetContext === 'inventory') {
      confirmInventoryBarcode(matched.evidenceNumber);
      resultBox.innerHTML = `
        <div style="background:#f0fdf4; border:1.5px solid #22c55e; border-radius:10px; padding:14px; text-align:right;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-weight:900; color:#166534; font-size:14px;"><i class="fa-solid fa-circle-check"></i> تم فحص ومطابقة الحرز بالجرد بنجاح!</span>
            <span class="badge" style="background:#166534; color:#fff; font-family:monospace;">${escapeHtml(matched.evidenceNumber)}</span>
          </div>
          <div style="font-size:12.5px; color:#334155; line-height:1.5; margin-bottom:10px;">
            <strong>القضية:</strong> ${escapeHtml(matched.caseNumber)} | <strong>النوع:</strong> ${escapeHtml(matched.itemType)} | <strong>المكان:</strong> ${escapeHtml(matched.storageLocation || 'المخزن')}
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn-green" style="flex:1;" onclick="resumeScannerLoop()"><i class="fa-solid fa-camera"></i> متابعة مسح الحرز التالي</button>
            <button class="btn-blue" onclick="closeLiveCameraScannerModal(); switchTab('inventoryAudit');"><i class="fa-solid fa-clipboard-check"></i> عرض محضر الجرد</button>
          </div>
        </div>
      `;
      return;
    }

    // General Context: Show comprehensive evidence card
    resultBox.innerHTML = `
      <div style="background:#f8fafc; border:1.5px solid #0284c7; border-top:3px solid #c59b27; border-radius:10px; padding:14px; text-align:right;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <span style="font-size:11px; color:#64748b; font-weight:bold;">تم التعرف على الحرز:</span>
            <div style="font-size:16px; font-weight:900; color:#1e3a8a; font-family:monospace;">${escapeHtml(matched.evidenceNumber)}</div>
          </div>
          <span class="badge" style="background:#0f172a; color:#fff; padding:4px 8px;">${escapeHtml(matched.status || 'في المخزن')}</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:12px; background:#fff; padding:8px; border-radius:6px; border:1px solid #e2e8f0; margin-bottom:10px;">
          <div><strong>رقم القضية:</strong> ${escapeHtml(matched.caseNumber)}</div>
          <div><strong>النيابة:</strong> ${escapeHtml(matched.partialProsecution || matched.appealProsecution || '-')}</div>
          <div><strong>نوع الحرز:</strong> ${escapeHtml(matched.itemType)}</div>
          <div><strong>موضع الحفظ:</strong> ${escapeHtml(matched.storageLocation || 'المخزن الرئيسي')}</div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-blue" style="flex:1; padding:8px 12px; font-size:12px;" onclick="closeLiveCameraScannerModal(); openDetailsModal('${matched.id}')">
            <i class="fa-solid fa-folder-open"></i> فتح ملف الحرز والقرارات
          </button>
          <button class="btn-green" style="padding:8px 12px; font-size:12px;" onclick="printEvidenceThermalSticker('${matched.id}', 'thermal_5x7')">
            <i class="fa-solid fa-print"></i> استيكر (5×7)
          </button>
          <button class="btn-secondary" style="padding:8px 12px; font-size:12px;" onclick="resumeScannerLoop()">
            <i class="fa-solid fa-arrows-rotate"></i> مسح آخر
          </button>
        </div>
      </div>
    `;
  } else {
    // Code not found in database
    resultBox.innerHTML = `
      <div style="background:#fff1f2; border:1.5px solid #f43f5e; border-radius:10px; padding:14px; text-align:right;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:900; color:#9f1239;"><i class="fa-solid fa-triangle-exclamation"></i> باركود غير مقيد بالمنظومة!</span>
          <span class="badge" style="background:#9f1239; color:#fff; font-family:monospace;">${escapeHtml(code)}</span>
        </div>
        <p style="font-size:12px; color:#881337; margin-bottom:10px;">
          الرمز المقروء <strong>"${escapeHtml(code)}"</strong> غير مسجل حالياً بسجل الأحراز المصرح لك بعرضها.
        </p>
        <div style="display:flex; gap:8px;">
          <button class="btn-blue" style="flex:1;" onclick="closeLiveCameraScannerModal(); switchTab('newEvidence'); document.getElementById('evidenceNumberInput').value='${escapeHtml(code)}'; handleEvidenceNumberManualInput('${escapeHtml(code)}');">
            <i class="fa-solid fa-plus-circle"></i> قيد كحرز جديد بهذا الكود
          </button>
          <button class="btn-secondary" onclick="resumeScannerLoop()"><i class="fa-solid fa-arrows-rotate"></i> إعادة المحاولة</button>
        </div>
      </div>
    `;
  }
}

function resumeScannerLoop() {
  isScannerPaused = false;
  const resultBox = document.getElementById('cameraScanResultBox');
  if (resultBox) resultBox.style.display = 'none';
  runCameraScanLoop();
}

function handleManualBarcodeInputInScanner() {
  const inp = document.getElementById('manualBarcodeScannerInput');
  if (!inp || !inp.value.trim()) return;
  handleDetectedBarcode(inp.value.trim());
}

// ============================================================================
// MODULE 3: SMART JUDICIAL ALERTS SYSTEM (منظومة التنبيهات القضائية الذكية)
// ============================================================================
function getJudicialAlerts() {
  const allEvs = (typeof getUserAccessibleEvidences === 'function') ? getUserAccessibleEvidences() : (typeof evidences !== 'undefined' ? evidences : []);
  const alerts = [];
  const now = new Date();

  allEvs.forEach(ev => {
    // 1. Perishable / Food / Drug Expiring Alerts
    const isPerishable = ev.itemType === 'أحراز تموينية' || 
      (ev.description && (ev.description.includes('غذائ') || ev.description.includes('لحوم') || ev.description.includes('دواجن') || ev.description.includes('أسماك') || ev.description.includes('أدوية') || ev.description.includes('صلاحية') || ev.description.includes('سريع التلف')));

    if (isPerishable && ev.status === 'في المخزن') {
      const seizure = new Date(ev.seizureDate || ev.createdAt || now);
      const days = Math.floor((now - seizure) / (1000 * 60 * 60 * 24));
      if (days >= 5) {
        alerts.push({
          id: `ALT-PER-${ev.id}`,
          evidenceId: ev.id,
          evidenceNumber: ev.evidenceNumber,
          caseNumber: ev.caseNumber,
          category: 'perishable',
          categoryLabel: 'مضبوطات تموينية وسريعة التلف',
          severity: (days > 15) ? 'CRITICAL' : 'HIGH',
          title: `حرز تمويني معرض للتلف (مضى ${days} يوماً بالتحريز)`,
          details: `المضبوطات (${ev.description || ev.itemType}) محفوظة بمستودع الأحراز منذ ${days} يوماً دون تصرف نهائي، مما يعرضها للهلاك أو انقضاء مدة الصلاحية.`,
          legalRef: 'المادة 101 من قانون الإجراءات الجنائية، ومادة 725 من تعليمات النيابة العامة (وجوب بيع السلع المعرضة للتلف وإيداع الثمن خزانة المحكمة لحساب القضية).',
          daysElapsed: days
        });
      }
    }

    // Specific Food Supplies Expiry Alert (تنبيه قرب انتهاء تاريخ الصلاحية للسلع التموينية)
    if (ev.foodExpiryDate && ev.status === 'في المخزن') {
      const expDate = new Date(ev.foodExpiryDate);
      const daysUntilExp = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntilExp <= 30) {
        alerts.push({
          id: `ALT-EXP-${ev.id}`,
          evidenceId: ev.id,
          evidenceNumber: ev.evidenceNumber,
          caseNumber: ev.caseNumber,
          category: 'perishable',
          categoryLabel: 'قرب انتهاء تاريخ الصلاحية (سلع تموينية)',
          severity: (daysUntilExp <= 5) ? 'CRITICAL' : (daysUntilExp <= 15 ? 'HIGH' : 'MEDIUM'),
          title: (daysUntilExp <= 0) 
            ? `حرز تمويني منتهي الصلاحية فعلياً منذ (${Math.abs(daysUntilExp)}) يوماً` 
            : `تنبيه: اقتراب انتهاء تاريخ صلاحية حرز تمويني (متبقي ${daysUntilExp} يوماً)`,
          details: `الحرز رقم (${ev.evidenceNumber}) سلع تموينية تاريخ انتهاء صلاحيته هو (${ev.foodExpiryDate}). يلزم سرعة استصدار قرار قضائي بالتصرف أو الإعدام أو البيع الفوري لحساب القضية.`,
          legalRef: 'المادة 101 من قانون الإجراءات الجنائية والتعليمات العامة للنيابات بشأن المضبوطات التموينية سريعة التلف.',
          daysElapsed: daysUntilExp
        });
      }
    }

    // 2. Pending Judicial Decisions Not Executed After > 15 Days
    // Search history or prosecutionAction for execution orders
    const history = Array.isArray(ev.history) ? ev.history : [];
    const executionDecisions = ['بيع بالمزاد', 'إعدام بمحضر رسمي', 'تسليم للمالك', 'مصادرة لصالح الخزانة', 'تسليم لجهة حكومية'];
    
    // Look for an action that ordered sale or destruction while status is still in custody
    const pendingOrder = history.find(h => 
      executionDecisions.some(d => (h.actionType && h.actionType.includes(d)) || (h.details && h.details.includes(d)))
    ) || (ev.prosecutionAction && executionDecisions.some(d => ev.prosecutionAction.includes(d)) ? { actionType: ev.prosecutionAction, date: ev.seizureDate } : null);

    if (pendingOrder && (ev.status === 'في المخزن' || ev.status === 'قيد الانتظار')) {
      const orderDate = new Date(pendingOrder.date || ev.seizureDate || now);
      const daysSinceOrder = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      if (daysSinceOrder > 15) {
        alerts.push({
          id: `ALT-DEC-${ev.id}`,
          evidenceId: ev.id,
          evidenceNumber: ev.evidenceNumber,
          caseNumber: ev.caseNumber,
          category: 'delayed_execution',
          categoryLabel: 'قرارات قضائية متأخرة التنفيذ (> 15 يوماً)',
          severity: 'CRITICAL',
          title: `قرار قضائي (${pendingOrder.actionType || ev.prosecutionAction}) متأخر منذ ${daysSinceOrder} يوماً`,
          details: `صدر قرار النيابة بالتصرف في الحرز بتاريخ (${pendingOrder.date || 'سابق'}) ولم يُنفذ فعلياً بالمخزن حتى تاريخه (تجاوز مهلة الـ 15 يوماً المقررة بالكتب الدورية).`,
          legalRef: 'الكتاب الدوري للنائب العام رقم 3 لسنة 2021 بشأن حتمية سرعة تنفيذ قرارات التصرف في المضبوطات خلال 15 يوماً بحد أقصى.',
          daysElapsed: daysSinceOrder
        });
      }
    }

    // 3. High Value Currency or Jewelry in Ordinary Storage
    const isValuable = (ev.itemType === 'أموال' || ev.itemType === 'مصوغات' || ev.jewelryEstimatedValue || ev.moneyAmount);
    if (isValuable && ev.status === 'في المخزن') {
      const loc = (ev.storageLocation || '').toLowerCase();
      const isSecuredSafe = loc.includes('خزينة') || loc.includes('خزانه') || loc.includes('بنك') || loc.includes('مركزي') || loc.includes('مؤمن');
      if (!isSecuredSafe) {
        alerts.push({
          id: `ALT-VAL-${ev.id}`,
          evidenceId: ev.id,
          evidenceNumber: ev.evidenceNumber,
          caseNumber: ev.caseNumber,
          category: 'valuables_security',
          categoryLabel: 'تأمين المبالغ والمصوغات',
          severity: 'WARNING',
          title: `مبالغ نقدية / مصوغات محفوظة بمستودع عادي دون خزينة مؤمنة`,
          details: `الحرز مقيد كـ (${ev.itemType}) ومحفوظ بموضع: "${ev.storageLocation || 'مخزن عادي'}"، ويلزم إيداعه بالخزينة الحديدية المؤمنة أو البنك المركزي.`,
          legalRef: 'المادة 126 من قانون البنك المركزي 194 لسنة 2020، وقانون المعادن الثمينة 68 لسنة 1976.',
          daysElapsed: 0
        });
      }
    }

    // 4. Evidences Exceeding 3 Years in Storage (أحراز تجاوزت 3 سنوات - تنبيه قانوني ملزم)
    const seizureDate = new Date(ev.seizureDate || ev.createdAt || now);
    const diffDaysSeizure = Math.floor((now - seizureDate) / (1000 * 60 * 60 * 24));
    if (diffDaysSeizure >= (3 * 365) && (ev.status === 'في المخزن' || ev.status === 'مرسل للمعمل الجنائي' || ev.status === 'قيد الانتظار')) {
      const yearsExact = (diffDaysSeizure / 365.25).toFixed(1);
      alerts.push({
        id: `ALT-3YR-${ev.id}`,
        evidenceId: ev.id,
        evidenceNumber: ev.evidenceNumber,
        caseNumber: ev.caseNumber,
        category: 'statute_3years',
        categoryLabel: 'أحراز تجاوزت 3 سنوات (تنبيه قانوني)',
        severity: 'CRITICAL',
        title: `تنبيه قضائي: مضى أكثر من 3 سنوات على قيد الحرز (${yearsExact} سنوات - ${diffDaysSeizure} يوماً)`,
        details: `مضى أكثر من 3 سنوات على قيد هذا الحرز بالمستودع دون تصرف قضائي بات. تنص التعليمات القضائية للنيابة العامة وقانون الإجراءات الجنائية على وجوب المتابعة الدورية للأحراز التي مضى عليها 3 سنوات وعرضها على السيد المستشار المحامي العام الأول لاتخاذ قرار بالتصرف النهائي أو البيع بالمزاد أو الإعدام والمصادرة.`,
        legalRef: 'المادة 108 مكرر من قانون الإجراءات الجنائية، والتعليمات العامة للنيابات (الكتاب الدوري بشأن جرد الأحراز والتصرف في المضبوطات التي مضت عليها ثلاث سنوات).',
        daysElapsed: diffDaysSeizure
      });
    }
  });

  return alerts;
}

function updateJudicialAlertsBadge() {
  const alerts = getJudicialAlerts();
  const count = alerts.length;
  const badge = document.getElementById('judicialAlertsCountBadge');
  const bellBtn = document.getElementById('judicialAlertsBellBtn');

  if (badge) {
    badge.textContent = count;
    badge.style.display = (count > 0) ? 'inline-block' : 'none';
  }
  if (bellBtn) {
    if (count > 0) {
      bellBtn.classList.add('has-urgent-alerts');
      bellBtn.title = `يوجد ${count} تنبيهات قضائية عاجلة تتطلب اتخاذ إجراء`;
    } else {
      bellBtn.classList.remove('has-urgent-alerts');
      bellBtn.title = 'منظومة التنبيهات القضائية الذكية (لا توجد متأخرات)';
    }
  }
}

function openJudicialAlertsModal() {
  const modal = document.getElementById('judicialAlertsModal');
  if (modal) modal.style.display = 'flex';
  renderJudicialAlertsList('all');
}

function closeJudicialAlertsModal() {
  const modal = document.getElementById('judicialAlertsModal');
  if (modal) modal.style.display = 'none';
}

function renderJudicialAlertsList(categoryFilter = 'all') {
  const listEl = document.getElementById('judicialAlertsContainer');
  if (!listEl) return;

  const alerts = getJudicialAlerts();
  const filtered = (categoryFilter === 'all') 
    ? alerts 
    : alerts.filter(a => a.category === categoryFilter);

  // Update tabs active state
  document.querySelectorAll('.alert-filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-filter') === categoryFilter);
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:45px 20px; color:#64748b;">
        <i class="fa-solid fa-circle-check" style="font-size:42px; color:#22c55e; margin-bottom:12px;"></i>
        <h3 style="font-size:16px; font-weight:800; color:#1e293b; margin-bottom:4px;">لا توجد تنبيهات متأخرة في هذا التصنيف</h3>
        <p style="font-size:13px;">كافة الأحراز والقرارات القضائية مطابقة للمدد القانونية المنصوص عليها.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered.map(alt => {
    const isCrit = alt.severity === 'CRITICAL';
    const isWarn = alt.severity === 'WARNING';
    const borderColor = isCrit ? '#dc2626' : (isWarn ? '#d97706' : '#2563eb');
    const badgeBg = isCrit ? '#fee2e2' : (isWarn ? '#fef3c7' : '#eff6ff');
    const badgeColor = isCrit ? '#991b1b' : (isWarn ? '#92400e' : '#1e40af');

    return `
      <div class="alert-item-card" style="background:#ffffff; border:1.5px solid #cbd5e1; border-right:5px solid ${borderColor}; border-radius:10px; padding:16px; margin-bottom:12px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span class="badge" style="background:${badgeBg}; color:${badgeColor}; font-weight:800; font-size:11px;">
                <i class="fa-solid fa-triangle-exclamation"></i> ${alt.severity === 'CRITICAL' ? 'حرج جداً' : 'تنبيه قضائي'}
              </span>
              <span style="font-size:12px; font-weight:bold; color:#475569;">${escapeHtml(alt.categoryLabel)}</span>
            </div>
            <h4 style="margin:0; font-size:14.5px; font-weight:900; color:#0f172a;">${escapeHtml(alt.title)}</h4>
          </div>
          <div style="text-align:left;">
            <span style="font-family:monospace; font-size:13px; font-weight:bold; background:#0f172a; color:#fff; padding:3px 8px; border-radius:6px;">${escapeHtml(alt.evidenceNumber)}</span>
            <div style="font-size:11px; color:#64748b; margin-top:3px;">قضية: ${escapeHtml(alt.caseNumber)}</div>
          </div>
        </div>

        <p style="font-size:13px; color:#334155; line-height:1.5; margin-bottom:8px;">${escapeHtml(alt.details)}</p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px 12px; font-size:11.5px; color:#475569; margin-bottom:12px;">
          <strong style="color:#1e3a8a;"><i class="fa-solid fa-scale-balanced"></i> السند القانوني:</strong> ${escapeHtml(alt.legalRef)}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-top:1px dashed #e2e8f0; padding-top:10px;">
          <span style="font-size:11.5px; color:#64748b;"><i class="fa-regular fa-clock"></i> المدة المنقضية: <strong>${alt.daysElapsed} يوماً</strong></span>
          <div style="display:flex; gap:6px;">
            <button class="btn-green" style="padding:5px 12px; font-size:12px;" onclick="closeJudicialAlertsModal(); switchTab('procedures', '${alt.evidenceId}')">
              <i class="fa-solid fa-gavel"></i> تنفيذ الإجراء القضائي الآن
            </button>
            <button class="btn-blue" style="padding:5px 12px; font-size:12px;" onclick="closeJudicialAlertsModal(); openDetailsModal('${alt.evidenceId}')">
              <i class="fa-solid fa-eye"></i> معاينة الحرز
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// MODULE 4: WAREHOUSE PHYSICAL INVENTORY AUDIT (محضر الجرد الدوري السنوي والشهري)
// ============================================================================
let activeInventoryAudit = {
  sessionType: 'جرد سنوي شامل',
  storageLocation: 'جميع المخازن والمستودعات',
  auditDate: new Date().toISOString().split('T')[0],
  inspectorName: 'المستشار رئيس النيابة',
  committeeMembers: 'أمين العهدة ومحرر التحقيق',
  verifiedItems: {}, // evidenceNumber -> { verifiedAt, verifiedBy, notes }
  surplusItems: []   // array of unrecorded scanned items
};

function initInventoryAuditSession() {
  const accessible = (typeof getUserAccessibleEvidences === 'function') ? getUserAccessibleEvidences() : (typeof evidences !== 'undefined' ? evidences : []);
  
  // Set default inspector to current user
  if (typeof currentUser !== 'undefined' && currentUser) {
    const inspInput = document.getElementById('inventoryInspectorInput');
    if (inspInput && !inspInput.value) {
      inspInput.value = currentUser.username;
    }
  }

  // Load any saved audit state for today
  try {
    const raw = localStorage.getItem('judicial_active_inventory_audit_v1');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && saved.auditDate === activeInventoryAudit.auditDate) {
        activeInventoryAudit = saved;
      }
    }
  } catch(e) {}

  renderInventoryAuditMetrics();
  renderInventoryAuditTable();
}

function saveInventoryAuditState() {
  try {
    localStorage.setItem('judicial_active_inventory_audit_v1', JSON.stringify(activeInventoryAudit));
  } catch(e) {}
}

function renderInventoryAuditMetrics() {
  const accessible = (typeof getUserAccessibleEvidences === 'function') ? getUserAccessibleEvidences() : (typeof evidences !== 'undefined' ? evidences : []);
  
  // Filter by selected location and date range if specified
  const locSel = document.getElementById('inventoryLocationFilter');
  const selLoc = locSel ? locSel.value : 'all';
  const dateFrom = document.getElementById('invAuditDateFrom')?.value || '';
  const dateTo = document.getElementById('invAuditDateTo')?.value || '';

  const targetEvs = accessible.filter(e => {
    if (selLoc !== 'all' && !(e.storageLocation || '').includes(selLoc)) return false;
    const d = e.seizureDate || e.createdAt;
    if (dateFrom && d && d < dateFrom) return false;
    if (dateTo && d && d > dateTo) return false;
    return true;
  });

  const totalRegistry = targetEvs.length;
  let verifiedCount = 0;
  
  targetEvs.forEach(e => {
    if (activeInventoryAudit.verifiedItems[e.evidenceNumber]) {
      verifiedCount++;
    }
  });

  const deficitCount = Math.max(0, totalRegistry - verifiedCount);
  const surplusCount = activeInventoryAudit.surplusItems.length;
  const percent = totalRegistry > 0 ? Math.round((verifiedCount / totalRegistry) * 100) : 0;

  const totalEl = document.getElementById('invMetricTotal');
  const verifiedEl = document.getElementById('invMetricVerified');
  const deficitEl = document.getElementById('invMetricDeficit');
  const surplusEl = document.getElementById('invMetricSurplus');
  const percentEl = document.getElementById('invMetricPercent');
  const progressEl = document.getElementById('invProgressBar');

  if (totalEl) totalEl.textContent = totalRegistry;
  if (verifiedEl) verifiedEl.textContent = verifiedCount;
  if (deficitEl) deficitEl.textContent = deficitCount;
  if (surplusEl) surplusEl.textContent = surplusCount;
  if (percentEl) percentEl.textContent = `${percent}%`;
  if (progressEl) progressEl.style.width = `${percent}%`;
}

function handleInventoryBarcodeScan(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const inp = document.getElementById('inventoryScanBarcodeInput');
    if (!inp) return;
    const code = inp.value.trim();
    if (!code) return;
    confirmInventoryBarcode(code);
    inp.value = '';
    inp.focus();
  }
}

function confirmInventoryBarcode(rawCode) {
  if (!rawCode) return;
  const code = rawCode.trim();
  const accessible = (typeof getUserAccessibleEvidences === 'function') ? getUserAccessibleEvidences() : (typeof evidences !== 'undefined' ? evidences : []);
  
  const matched = accessible.find(e => 
    (e.evidenceNumber && e.evidenceNumber.toLowerCase() === code.toLowerCase()) ||
    (e.evidenceNumber && e.evidenceNumber.replace(/-/g, '').toLowerCase() === code.replace(/-/g, '').toLowerCase()) ||
    (e.caseNumber && e.caseNumber === code)
  );

  const nowStr = new Date().toLocaleTimeString('ar-EG');
  const userStr = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.username : 'لجنة الجرد';

  if (matched) {
    playScanBeepSound();
    activeInventoryAudit.verifiedItems[matched.evidenceNumber] = {
      verifiedAt: nowStr,
      verifiedBy: userStr,
      notes: 'تم الفحص المباشر بالمستودع - الحرز سليم ومطابق للشمع'
    };
    saveInventoryAuditState();
    renderInventoryAuditMetrics();
    renderInventoryAuditTable();
    showToast(`✅ تم جرد ومطابقة الحرز بنجاح: ${matched.evidenceNumber}`);
  } else {
    // Unrecorded surplus item detected
    playScanBeepSound();
    const existingSurplus = activeInventoryAudit.surplusItems.find(s => s.code === code);
    if (!existingSurplus) {
      activeInventoryAudit.surplusItems.push({
        code: code,
        detectedAt: nowStr,
        detectedBy: userStr,
        notes: 'حرز زائد أو غير مقيد بسجل النيابة'
      });
      saveInventoryAuditState();
      renderInventoryAuditMetrics();
      renderInventoryAuditTable();
    }
    showToast(`⚠️ تم رصد حرز إضافي غير مقيد بالسجل: ${code}`, true);
  }
}

function markInventoryItemManually(evNumber, isVerified) {
  if (isVerified) {
    const nowStr = new Date().toLocaleTimeString('ar-EG');
    const userStr = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.username : 'عضو اللجنة';
    activeInventoryAudit.verifiedItems[evNumber] = {
      verifiedAt: nowStr,
      verifiedBy: userStr,
      notes: 'تأكيد يدوي من قبل لجنة الجرد'
    };
    showToast(`تم تأكيد مطابقة الحرز: ${evNumber}`);
  } else {
    delete activeInventoryAudit.verifiedItems[evNumber];
    showToast(`تم إلغاء مطابقة الحرز: ${evNumber}`);
  }
  saveInventoryAuditState();
  renderInventoryAuditMetrics();
  renderInventoryAuditTable();
}

function renderInventoryAuditTable(filterStatus = 'all') {
  const tbody = document.getElementById('inventoryAuditTableBody');
  if (!tbody) return;

  const accessible = (typeof getUserAccessibleEvidences === 'function') ? getUserAccessibleEvidences() : (typeof evidences !== 'undefined' ? evidences : []);
  const locSel = document.getElementById('inventoryLocationFilter');
  const selLoc = locSel ? locSel.value : 'all';
  const dateFrom = document.getElementById('invAuditDateFrom')?.value || '';
  const dateTo = document.getElementById('invAuditDateTo')?.value || '';

  const targetEvs = accessible.filter(e => {
    if (selLoc !== 'all' && !(e.storageLocation || '').includes(selLoc)) return false;
    const d = e.seizureDate || e.createdAt;
    if (dateFrom && d && d < dateFrom) return false;
    if (dateTo && d && d > dateTo) return false;
    return true;
  });

  let rowsHtml = '';

  targetEvs.forEach((ev, idx) => {
    const isVerified = !!activeInventoryAudit.verifiedItems[ev.evidenceNumber];
    const auditInfo = activeInventoryAudit.verifiedItems[ev.evidenceNumber];

    if (filterStatus === 'verified' && !isVerified) return;
    if (filterStatus === 'deficit' && isVerified) return;

    const statusBadge = isVerified 
      ? `<span class="badge" style="background:#22c55e; color:#fff; font-size:11px;"><i class="fa-solid fa-check-double"></i> مطابق ومفحوص</span>`
      : `<span class="badge" style="background:#64748b; color:#fff; font-size:11px;"><i class="fa-solid fa-hourglass-half"></i> لم يتم الفحص</span>`;

    rowsHtml += `
      <tr style="${isVerified ? 'background: #f0fdf4;' : ''}">
        <td style="font-weight:bold; width:35px; text-align:center;">${idx + 1}</td>
        <td>
          <span style="font-family:monospace; font-weight:bold; font-size:12.5px; color:#1e3a8a;">${escapeHtml(ev.evidenceNumber)}</span>
        </td>
        <td><strong>${escapeHtml(ev.caseNumber)}</strong></td>
        <td>${escapeHtml(ev.partialProsecution || ev.appealProsecution || '-')}</td>
        <td>${escapeHtml(ev.itemType)}</td>
        <td>${escapeHtml(ev.storageLocation || 'المخزن الرئيسي')}</td>
        <td>${statusBadge}</td>
        <td style="font-size:11px; color:#475569;">
          ${isVerified ? `${auditInfo.verifiedAt} (${auditInfo.verifiedBy})` : '-'}
        </td>
        <td style="font-size:11.5px; color:#334155;">
          ${isVerified ? escapeHtml(auditInfo.notes) : '<span style="color:#64748b;">لم يتم الفحص بعد</span>'}
        </td>
        <td style="text-align:center;">
          ${isVerified 
            ? `<button class="btn-secondary" style="padding:3px 8px; font-size:11px;" onclick="markInventoryItemManually('${ev.evidenceNumber}', false)" title="إلغاء المطابقة"><i class="fa-solid fa-xmark"></i> إلغاء</button>`
            : `<button class="btn-green" style="padding:3px 8px; font-size:11px;" onclick="markInventoryItemManually('${ev.evidenceNumber}', true)" title="تأكيد الجرد يدوياً"><i class="fa-solid fa-check"></i> مطابقة</button>`
          }
        </td>
      </tr>
    `;
  });

  // Also append surplus items if filter is 'all' or 'surplus'
  if (filterStatus === 'all' || filterStatus === 'surplus') {
    activeInventoryAudit.surplusItems.forEach((surplus, sIdx) => {
      rowsHtml += `
        <tr style="background:#fffbeb;">
          <td style="font-weight:bold; width:35px; text-align:center;">+${sIdx + 1}</td>
          <td><span style="font-family:monospace; font-weight:bold; color:#b45309;">${escapeHtml(surplus.code)}</span></td>
          <td colspan="4" style="color:#b45309; font-weight:bold;">حرز زائد تم رصده بالمستودع غير مقيد بالدفتر الإلكتروني</td>
          <td><span class="badge" style="background:#d97706; color:#fff; font-size:11px;">⚠️ فائض / غير مقيد</span></td>
          <td style="font-size:11px;">${surplus.detectedAt} (${surplus.detectedBy})</td>
          <td style="font-size:11px; color:#b45309;">${escapeHtml(surplus.notes)}</td>
          <td>-</td>
        </tr>
      `;
    });
  }

  tbody.innerHTML = rowsHtml || `<tr><td colspan="10" style="text-align:center; padding:25px; color:#64748b;">لا توجد أحراز مطابقة لفلتر الجرد المحدد</td></tr>`;
}

function printOfficialInventoryAuditReport() {
  const accessible = (typeof getUserAccessibleEvidences === 'function') ? getUserAccessibleEvidences() : (typeof evidences !== 'undefined' ? evidences : []);
  const locSel = document.getElementById('inventoryLocationFilter');
  const selLoc = locSel ? locSel.value : 'all';
  const sessionTypeSel = document.getElementById('inventorySessionTypeSelect');
  const sessionType = sessionTypeSel ? sessionTypeSel.value : activeInventoryAudit.sessionType;
  const inspectorInp = document.getElementById('inventoryInspectorInput');
  const inspectorName = inspectorInp ? inspectorInp.value : activeInventoryAudit.inspectorName;
  const dateFrom = document.getElementById('invAuditDateFrom')?.value || '';
  const dateTo = document.getElementById('invAuditDateTo')?.value || '';

  const targetEvs = accessible.filter(e => {
    if (selLoc !== 'all' && !(e.storageLocation || '').includes(selLoc)) return false;
    const d = e.seizureDate || e.createdAt;
    if (dateFrom && d && d < dateFrom) return false;
    if (dateTo && d && d > dateTo) return false;
    return true;
  });

  const totalRegistry = targetEvs.length;

  const verifiedList = [];
  const deficitList = [];

  targetEvs.forEach(ev => {
    if (activeInventoryAudit.verifiedItems[ev.evidenceNumber]) {
      verifiedList.push(ev);
    } else {
      deficitList.push(ev);
    }
  });

  const surplusList = activeInventoryAudit.surplusItems;
  const matchRate = totalRegistry > 0 ? Math.round((verifiedList.length / totalRegistry) * 100) : 0;
  const auditDate = new Date().toLocaleDateString('ar-EG');
  const periodText = (dateFrom || dateTo) ? `الفترة من: ${dateFrom || 'البداية'} إلى: ${dateTo || 'تاريخه'}` : 'كافة الأحراز المقيدة بالدفتر';

  const printHtml = `
    <div class="official-inventory-report" style="font-family:'Cairo', Tahoma, sans-serif; direction:rtl; text-align:right; padding:20px; background:#fff;">
      <!-- Official Header -->
      <div style="border-bottom:2.5px solid #000; padding-bottom:12px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="font-size:13px; font-weight:bold; line-height:1.4;">
            جمهورية مصر العربية<br>
            النيابة العامة<br>
            إدارة التفتيش القضائي والنيابات<br>
            مستودع المضبوطات والأحراز القضائية
          </div>
          <div style="text-align:center;">
            <h1 style="font-size:22px; margin:0; font-weight:900;">محضر جرد فعلي لمستودع الأحراز القضائية</h1>
            <h3 style="font-size:14px; margin:4px 0; color:#333;">(${escapeHtml(sessionType)})</h3>
            <div style="font-size:12px; font-weight:bold; border:1px solid #000; padding:2px 8px; display:inline-block; margin-top:4px;">
              معتمد للتفتيش القضائي والمتابعة الرقابية • ${periodText}
            </div>
          </div>
          <div style="font-size:12px; text-align:left; line-height:1.4;">
            <strong>تاريخ الجرد:</strong> ${auditDate}<br>
            <strong>رقم المحضر:</strong> جرد-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}<br>
            <strong>نطاق الجرد:</strong> ${escapeHtml(selLoc === 'all' ? 'كافة المستودعات والخزائن' : selLoc)}
          </div>
        </div>
      </div>

      <!-- Legal Preamble -->
      <div style="background:#f8fafc; border:1px solid #000; padding:10px 14px; font-size:13px; line-height:1.6; margin-bottom:16px;">
        <strong>ديباجة تشكيل لجنة الجرد:</strong> إنه في يوم الموافق <strong>${auditDate}</strong>، وبناءً على تعليمات النيابة العامة وقانون الإجراءات الجنائية رقم 150 لسنة 1950، والكتب الدورية للتفتيش القضائي، تشكلت لجنة الجرد برئاسة السيد الأستاذ: <strong>${escapeHtml(inspectorName)}</strong>، وعضوية كل من أمين مستودع الأحراز وكاتب التحقيق، وقامت اللجنة بمطابقة الأحراز الموجودة فعلياً على الأرفف وداخل الخزائن بالدفتر الإلكتروني للمنظومة (${periodText}) باستخدام قارئ الباركود الرقمي، وأسفر الجرد عن الآتي:
      </div>

      <!-- Summary Statistics Table -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:13px; text-align:center;">
        <thead>
          <tr style="background:#e2e8f0;">
            <th style="border:1.5px solid #000; padding:8px;">إجمالي الأحراز بالدفتر</th>
            <th style="border:1.5px solid #000; padding:8px; background:#dcfce7;">الأحراز المطابقة فعلياً</th>
            <th style="border:1.5px solid #000; padding:8px; background:#f1f5f9;">لم يتم الفحص بعد</th>
            <th style="border:1.5px solid #000; padding:8px; background:#fef3c7;">أحراز زيادة (غير مقيدة)</th>
            <th style="border:1.5px solid #000; padding:8px;">نسبة المطابقة الدفترية</th>
          </tr>
        </thead>
        <tbody>
          <tr style="font-weight:bold; font-size:15px;">
            <td style="border:1.5px solid #000; padding:8px;">${totalRegistry} حرز</td>
            <td style="border:1.5px solid #000; padding:8px; color:#15803d;">${verifiedList.length} حرز</td>
            <td style="border:1.5px solid #000; padding:8px; color:#475569;">${deficitList.length} حرز</td>
            <td style="border:1.5px solid #000; padding:8px; color:#b45309;">${surplusList.length} حرز</td>
            <td style="border:1.5px solid #000; padding:8px;">${matchRate}%</td>
          </tr>
        </tbody>
      </table>

      <!-- Uninspected Table -->
      <h3 style="font-size:14.5px; font-weight:800; margin-bottom:6px; color:#1e3a8a;">
        <i class="fa-solid fa-hourglass-half"></i> أولاً: بيان الأحراز التي لم يتم الفحص بعد بشأنها بالمستودع (${deficitList.length} حرز):
      </h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:11.5px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="border:1px solid #000; padding:5px; width:30px;">م</th>
            <th style="border:1px solid #000; padding:5px; width:130px;">رقم الحرز</th>
            <th style="border:1px solid #000; padding:5px; width:130px;">رقم القضية</th>
            <th style="border:1px solid #000; padding:5px;">النيابة المختصة</th>
            <th style="border:1px solid #000; padding:5px;">نوع الحرز والوصف</th>
            <th style="border:1px solid #000; padding:5px; width:120px;">الموضع الدفتري</th>
            <th style="border:1px solid #000; padding:5px; width:130px;">ملاحظات وقرار اللجنة</th>
          </tr>
        </thead>
        <tbody>
          ${deficitList.length === 0 ? `<tr><td colspan="7" style="border:1px solid #000; padding:10px; text-align:center; font-weight:bold; color:#15803d;">كافة الأحراز المسجلة بالدفتر تم مطابقتها فعلياً بنسبة 100%.</td></tr>` : 
            deficitList.map((d, i) => `
              <tr>
                <td style="border:1px solid #000; padding:4px; text-align:center;">${i + 1}</td>
                <td style="border:1px solid #000; padding:4px; font-family:monospace; font-weight:bold;">${escapeHtml(d.evidenceNumber)}</td>
                <td style="border:1px solid #000; padding:4px;">${escapeHtml(d.caseNumber)}</td>
                <td style="border:1px solid #000; padding:4px;">${escapeHtml(d.partialProsecution || d.appealProsecution || '-')}</td>
                <td style="border:1px solid #000; padding:4px;">${escapeHtml(d.itemType)} - ${escapeHtml(d.description || '')}</td>
                <td style="border:1px solid #000; padding:4px;">${escapeHtml(d.storageLocation || '-')}</td>
                <td style="border:1px solid #000; padding:4px; color:#475569;">لم يتم الفحص بعد / قيد المتابعة</td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>

      <!-- Surplus Table (If Any) -->
      ${surplusList.length > 0 ? `
        <h3 style="font-size:14.5px; font-weight:800; margin-bottom:6px; color:#b45309;">
          ثانياً: بيان الأحراز الزائدة بالمستودع غير المقيدة بالدفتر (${surplusList.length} حرز):
        </h3>
        <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-size:11.5px;">
          <thead>
            <tr style="background:#fef3c7;">
              <th style="border:1px solid #000; padding:5px; width:30px;">م</th>
              <th style="border:1px solid #000; padding:5px; width:180px;">الباركود / الكود المقروء</th>
              <th style="border:1px solid #000; padding:5px;">وقت الرصد</th>
              <th style="border:1px solid #000; padding:5px;">القائم بالمسح</th>
              <th style="border:1px solid #000; padding:5px;">قرار اللجنة</th>
            </tr>
          </thead>
          <tbody>
            ${surplusList.map((s, i) => `
              <tr>
                <td style="border:1px solid #000; padding:4px; text-align:center;">${i + 1}</td>
                <td style="border:1px solid #000; padding:4px; font-family:monospace; font-weight:bold;">${escapeHtml(s.code)}</td>
                <td style="border:1px solid #000; padding:4px;">${s.detectedAt}</td>
                <td style="border:1px solid #000; padding:4px;">${s.detectedBy}</td>
                <td style="border:1px solid #000; padding:4px;">التحفظ والقيد بالدفتر بعد مضاهاة القضايا</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <!-- Committee Conclusion & Decision -->
      <div style="border:1.5px solid #000; padding:12px; margin-bottom:20px; font-size:12.5px; line-height:1.6; background:#f9fafb;">
        <strong>قرار وتوصيات لجنة الجرد والتفتيش القضائي:</strong><br>
        1. ${deficitList.length === 0 ? 'تثبيت صحة وسلامة العهدة الدفترية والفعلية لمستودع المضبوطات والأحراز بالكامل.' : `إحالة واقعة العجز لعدد (${deficitList.length}) أحراز إلى السيد المستشار المحامي العام الأول للتحقيق القضائي وتحديد المسؤولية التأديبية والجنائية.`}<br>
        2. متابعة تنفيذ قرارات البيع والإعدام المتأخرة خلال 15 يوماً تطبيقاً للكتاب الدوري.<br>
        3. إغلاق محضر الجرد في تمام الساعة ${new Date().toLocaleTimeString('ar-EG')}، وعرض الأصل على نيابة الاستئناف والتفتيش القضائي.
      </div>

      <!-- Signatures Grid -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; text-align:center; font-size:12px; font-weight:bold;">
        <div style="border:1px solid #000; padding:10px 4px;">
          أمين مستودع الأحراز<br><br><br>
          ........................................
        </div>
        <div style="border:1px solid #000; padding:10px 4px;">
          كاتب التحقيق ومقرر اللجنة<br><br><br>
          ........................................
        </div>
        <div style="border:1px solid #000; padding:10px 4px;">
          مدير إدارة المخازن والعهد<br><br><br>
          ........................................
        </div>
        <div style="border:1px solid #000; padding:10px 4px; background:#f1f5f9;">
          رئيس النيابة ورئيس لجنة الجرد<br><br><br>
          ........................................
        </div>
      </div>
    </div>
  `;

  const printArea = document.getElementById('printReportArea');
  if (printArea) {
    printArea.innerHTML = printHtml;
  }

  try {
    const printWin = window.open('', '_blank', 'width=900,height=750');
    if (printWin && !printWin.closed) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <title>محضر جرد مستودع الأحراز القضائية - ${auditDate}</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800;900&display=swap">
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { margin: 0; padding: 0; background: #fff; font-family: 'Cairo', Tahoma, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; }
          </style>
        </head>
        <body>
          ${printHtml}
        </body>
        </html>
      `);
      printWin.document.close();
      setTimeout(() => {
        try {
          printWin.focus();
          printWin.print();
        } catch(e) {
          window.print();
        }
      }, 350);
      return;
    }
  } catch(e) {}

  setTimeout(() => {
    window.print();
  }, 150);
}

// ============================================================================
// MODULE 5: VEHICLE VS NON-VEHICLE EVIDENCE HELPER
// ============================================================================
function isVehicleEvidence(ev) {
  if (!ev) return false;
  const t = String(ev.itemType || '').toLowerCase();
  const d = String(ev.description || '').toLowerCase();
  return t === 'سيارات' || t === 'مركبات' || t.includes('سيار') || t.includes('مركب') ||
         Boolean(ev.carPlateNumber || ev.carChassisNumber || ev.carMotorNumber);
}

// ============================================================================
// MODULE 6: COMPREHENSIVE MULTI-FIELD ADVANCED SEARCH ENGINE
// ============================================================================
function applyComprehensiveSearch(context = 'search') {
  const isSearch = context === 'search';
  const prefix = isSearch ? 'search' : 'procSearch';

  const evNum = (document.getElementById(prefix + 'EvNumber')?.value || '').trim().toLowerCase();
  const caseNum = (document.getElementById(prefix + 'CaseNumber')?.value || '').trim().toLowerCase();
  const pros = (document.getElementById(prefix + 'Prosecution')?.value || '').trim().toLowerCase();
  const itemType = (document.getElementById(prefix + 'ItemType')?.value || '').trim();
  const caseType = (document.getElementById(prefix + 'CaseType')?.value || '').trim();
  const status = (document.getElementById(prefix + 'Status')?.value || '').trim();
  const location = (document.getElementById(prefix + 'Location')?.value || '').trim().toLowerCase();
  const desc = (document.getElementById(prefix + 'Description')?.value || '').trim().toLowerCase();
  const extra = (document.getElementById(prefix + 'ExtraDetails')?.value || '').trim().toLowerCase();
  
  const dateFrom = isSearch ? (document.getElementById('searchDateFrom')?.value || '') : '';
  const dateTo = isSearch ? (document.getElementById('searchDateTo')?.value || '') : '';

  const allEvs = (typeof getUserAccessibleEvidences === 'function') 
    ? getUserAccessibleEvidences() 
    : (typeof evidences !== 'undefined' ? evidences : []);

  const filtered = allEvs.filter(ev => {
    // 1. Evidence Number
    if (evNum && !(ev.evidenceNumber || '').toLowerCase().includes(evNum)) return false;
    
    // 2. Case Number
    if (caseNum && !(ev.caseNumber || '').toLowerCase().includes(caseNum)) return false;

    // 3. Prosecution
    if (pros) {
      const p1 = (ev.appealProsecution || '').toLowerCase();
      const p2 = (ev.totalProsecution || '').toLowerCase();
      const p3 = (ev.partialProsecution || '').toLowerCase();
      if (!p1.includes(pros) && !p2.includes(pros) && !p3.includes(pros)) return false;
    }

    // 4. Item Type
    if (itemType && ev.itemType !== itemType) return false;

    // 5. Case Type
    if (caseType && ev.caseType !== caseType) return false;

    // 6. Status
    if (status && ev.status !== status) return false;

    // 7. Location
    if (location && !(ev.storageLocation || '').toLowerCase().includes(location)) return false;

    // 8. Description / Notes / Accused (Multi-term matching)
    if (desc) {
      const words = desc.split(/\s+/).filter(Boolean);
      const combined = `${ev.description || ''} ${ev.defendantRelation || ''} ${ev.seizingAuthority || ''} ${ev.policeStation || ''}`.toLowerCase();
      const matchAllWords = words.every(w => combined.includes(w));
      if (!matchAllWords) return false;
    }

    // 9. Extra Special Details (Phone IMEI serial, car chassis, weapon serial/caliber, expiry)
    if (extra) {
      const words = extra.split(/\s+/).filter(Boolean);
      const extraCombined = `${ev.phoneImeiSerial || ''} ${ev.phoneBrandModel || ''} ${ev.carChassisNumber || ''} ${ev.carPlateNumber || ''} ${ev.carMotorNumber || ''} ${ev.weaponCategory || ''} ${ev.weaponSerial || ''} ${ev.weaponCaliber || ''} ${ev.foodExpiryDate || ''}`.toLowerCase();
      const matchExtra = words.every(w => extraCombined.includes(w));
      if (!matchExtra) return false;
    }

    // 10. Date range
    if (dateFrom) {
      const d = ev.seizureDate || ev.createdAt;
      if (!d || d < dateFrom) return false;
    }
    if (dateTo) {
      const d = ev.seizureDate || ev.createdAt;
      if (!d || d > dateTo) return false;
    }

    return true;
  });

  if (isSearch) {
    const badge = document.getElementById('searchResultCountBadge');
    if (badge) badge.textContent = `${filtered.length} أحراز مطابقة`;
    renderComprehensiveSearchResultsTable(filtered);
  } else {
    const badge = document.getElementById('procSearchResultCountBadge');
    if (badge) badge.textContent = `${filtered.length} حرز مطابق`;
    renderProcedureSearchResultsTable(filtered);
  }

  return filtered;
}

function renderComprehensiveSearchResultsTable(list) {
  const tbody = document.getElementById('searchResultsTableBody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:25px; color:#64748b; font-size:13.5px;"><i class="fa-solid fa-magnifying-glass" style="font-size:20px; display:block; margin-bottom:8px; color:#cbd5e1;"></i>لم يتم العثور على أحراز مطابقة لحقول البحث المحددة. جرب تعديل الكلمات أو الضغط على "مسح وتفريغ الحقول".</td></tr>';
    return;
  }

  const isAdmin = currentUser && currentUser.role === 'admin';

  tbody.innerHTML = list.map(ev => `
    <tr>
      <td><strong style="color:#0f172a; font-family:monospace; font-size:13.5px;">${escapeHtml(ev.evidenceNumber)}</strong></td>
      <td><span style="font-weight:700; color:#0284c7;">${escapeHtml(ev.caseNumber)}</span></td>
      <td>${escapeHtml(ev.partialProsecution || ev.totalProsecution || ev.appealProsecution || '-')}</td>
      <td>
        <span class="badge-item-type">${escapeHtml(ev.itemType)}</span>
        <div style="font-size:11px; color:#64748b; margin-top:2px;">${escapeHtml(ev.caseType)}</div>
      </td>
      <td><strong>${escapeHtml(ev.storageLocation || '-')}</strong></td>
      <td><span class="badge ${ev.status === 'في المخزن' ? 'badge-in-custody' : 'badge-lab'}">${escapeHtml(ev.status)}</span></td>
      <td><small style="color:#475569;">${escapeHtml(ev.createdBy || '-')}<br>${escapeHtml(ev.createdAt || '-')}</small></td>
      <td>
        <div style="display:flex; gap:4px; flex-wrap:wrap;">
          <button type="button" class="btn-sm" style="background:#0f172a; color:#fff;" onclick="openPreviewModal('${ev.id}')" title="معاينة تفصيلية">
            <i class="fa-solid fa-eye"></i> معاينة
          </button>
          <button type="button" class="btn-sm" style="background:#1e3a5f; color:#fff;" onclick="quickOpenProcedureForEvidence('${ev.id}')" title="قيد إجراء قضائي">
            <i class="fa-solid fa-gavel"></i> إجراء
          </button>
          <button type="button" class="btn-sm" style="background:#2563eb; color:#fff;" onclick="openDetailsModal('${ev.id}')" title="طباعة باركود وبطاقة">
            <i class="fa-solid fa-print"></i> طباعة
          </button>
          ${isAdmin ? `
            <button type="button" class="btn-sm" style="background:#d97706; color:#fff;" onclick="openEditModal('${ev.id}')" title="تعديل">
              <i class="fa-solid fa-pen"></i> تعديل
            </button>
            <button type="button" class="btn-sm" style="background:#dc2626; color:#fff;" onclick="promptDeleteEvidence('${ev.id}')" title="حذف">
              <i class="fa-solid fa-trash"></i>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function renderProcedureSearchResultsTable(list) {
  const tbody = document.getElementById('procSearchResultsTableBody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:15px; color:#64748b;">لا توجد أحراز مطابقة للبحث</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(ev => `
    <tr>
      <td><strong style="font-family:monospace; color:#1e3a8a;">${escapeHtml(ev.evidenceNumber)}</strong></td>
      <td><strong style="color:#0284c7;">${escapeHtml(ev.caseNumber)}</strong></td>
      <td>${escapeHtml(ev.partialProsecution || '-')}</td>
      <td>${escapeHtml(ev.itemType)}</td>
      <td>${escapeHtml(ev.storageLocation || '-')}</td>
      <td><span class="badge ${ev.status === 'في المخزن' ? 'badge-in-custody' : 'badge-lab'}">${escapeHtml(ev.status)}</span></td>
      <td style="text-align:center;">
        <button type="button" class="btn-green" style="padding:4px 10px; font-size:11.5px; font-weight:bold;" onclick="handleSelectProcedureEvidence('${ev.id}')">
          <i class="fa-solid fa-check"></i> تحديد الحرز
        </button>
      </td>
    </tr>
  `).join('');
}

function resetComprehensiveSearch(context = 'search') {
  const isSearch = context === 'search';
  const prefix = isSearch ? 'search' : 'procSearch';

  const fields = ['EvNumber', 'CaseNumber', 'Prosecution', 'ItemType', 'CaseType', 'Status', 'Location', 'Description', 'ExtraDetails'];
  fields.forEach(f => {
    const el = document.getElementById(prefix + f);
    if (el) el.value = '';
  });

  if (isSearch) {
    const d1 = document.getElementById('searchDateFrom');
    const d2 = document.getElementById('searchDateTo');
    if (d1) d1.value = '';
    if (d2) d2.value = '';
  }

  applyComprehensiveSearch(context);
}

function exportComprehensiveSearchResultsToExcel(context = 'search') {
  const filtered = applyComprehensiveSearch(context);
  if (!filtered || filtered.length === 0) {
    showToast('لا توجد بيانات لتصديرها', true);
    return;
  }

  let csvContent = "\uFEFF"; // UTF-8 BOM
  csvContent += "رقم الحرز,رقم القضية,نيابة الاستئناف,النيابة الجزئية,نوع الحرز,نوع القضية,مكان الحفظ,الحالة الراهنة,تاريخ الضبط,جهة الضبط,المستخدم المدخل,الوصف\n";

  filtered.forEach(ev => {
    const row = [
      `"${(ev.evidenceNumber || '').replace(/"/g, '""')}"`,
      `"${(ev.caseNumber || '').replace(/"/g, '""')}"`,
      `"${(ev.appealProsecution || '').replace(/"/g, '""')}"`,
      `"${(ev.partialProsecution || ev.totalProsecution || '').replace(/"/g, '""')}"`,
      `"${(ev.itemType || '').replace(/"/g, '""')}"`,
      `"${(ev.caseType || '').replace(/"/g, '""')}"`,
      `"${(ev.storageLocation || '').replace(/"/g, '""')}"`,
      `"${(ev.status || '').replace(/"/g, '""')}"`,
      `"${(ev.seizureDate || '').replace(/"/g, '""')}"`,
      `"${(ev.seizingAuthority || '').replace(/"/g, '""')}"`,
      `"${(ev.createdBy || '').replace(/"/g, '""')}"`,
      `"${(ev.description || '').replace(/"/g, '""')}"`
    ];
    csvContent += row.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `نتائج_البحث_المتقدم_للأحراز_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`تم تصدير (${filtered.length}) سجل بنجاح بصيغة Excel / CSV`);
}

// ============================================================================
// MODULE 7: PROCEDURES MANAGEMENT SUB-TABS & DECISION EDIT/CANCEL
// ============================================================================
function switchProcedureSubTab(tab = 'all') {
  const secAll = document.getElementById('procSubSectionAll');
  const secNew = document.getElementById('procSubSectionNew');
  const btnAll = document.getElementById('btnProcSubTabAll');
  const btnNew = document.getElementById('btnProcSubTabNew');

  if (tab === 'all') {
    if (secAll) secAll.style.display = 'block';
    if (secNew) secNew.style.display = 'none';
    if (btnAll) {
      btnAll.style.background = '#c59b27';
      btnAll.style.color = '#0b192c';
    }
    if (btnNew) {
      btnNew.style.background = 'rgba(255,255,255,0.15)';
      btnNew.style.color = '#ffffff';
    }
    renderAllExecutedProceduresTable();
  } else {
    if (secAll) secAll.style.display = 'none';
    if (secNew) secNew.style.display = 'block';
    if (btnAll) {
      btnAll.style.background = 'rgba(255,255,255,0.15)';
      btnAll.style.color = '#ffffff';
    }
    if (btnNew) {
      btnNew.style.background = '#c59b27';
      btnNew.style.color = '#0b192c';
    }
    applyComprehensiveSearch('proc');
  }
}

function renderAllExecutedProceduresTable() {
  const tbody = document.getElementById('procAllExecutedTableBody');
  const allEvs = (typeof getUserAccessibleEvidences === 'function') 
    ? getUserAccessibleEvidences() 
    : (typeof evidences !== 'undefined' ? evidences : []);

  const allActions = [];
  let totalSold = 0;
  let totalDestruction = 0;
  let totalInterior = 0;
  let totalRevenue = 0;

  allEvs.forEach(ev => {
    if (Array.isArray(ev.history)) {
      ev.history.forEach(h => {
        allActions.push({ ev, h });
        if (h.actionType?.includes('بيع بالمزاد') || h.actionType?.includes('بيع')) {
          totalSold++;
          if (h.saleAmount) totalRevenue += Number(h.saleAmount);
        }
        if (h.actionType?.includes('إعدام') || h.actionType?.includes('إتلاف')) totalDestruction++;
        if (h.actionType?.includes('الداخلية') || h.actionType?.includes('تسليم الحرز إلى وزارة الداخلية')) totalInterior++;
      });
    }
  });

  allActions.sort((a, b) => new Date(b.h.date || 0) - new Date(a.h.date || 0));

  const mTotal = document.getElementById('procMetricTotal');
  const mSold = document.getElementById('procMetricSold');
  const mDest = document.getElementById('procMetricDestruction');
  const mInt = document.getElementById('procMetricInterior');
  const mRev = document.getElementById('procMetricRevenue');

  if (mTotal) mTotal.textContent = allActions.length;
  if (mSold) mSold.textContent = totalSold;
  if (mDest) mDest.textContent = totalDestruction;
  if (mInt) mInt.textContent = totalInterior;
  if (mRev) mRev.textContent = `${totalRevenue.toLocaleString('ar-EG')} ج.م`;

  if (!tbody) return;

  const filterType = document.getElementById('procFilterActionType')?.value || '';
  const filterDateFrom = document.getElementById('procFilterDateFrom')?.value || '';
  const filterDateTo = document.getElementById('procFilterDateTo')?.value || '';
  const filterKeyword = (document.getElementById('procFilterKeyword')?.value || '').trim().toLowerCase();

  const displayed = allActions.filter(({ ev, h }) => {
    if (filterType && !h.actionType.includes(filterType)) return false;
    if (filterDateFrom && h.date < filterDateFrom) return false;
    if (filterDateTo && h.date > filterDateTo) return false;
    if (filterKeyword) {
      const line = `${ev.evidenceNumber} ${ev.caseNumber} ${h.actionType} ${h.performedBy} ${h.docRef} ${h.details} ${h.electronicPaymentNumber || ''} ${h.transferNumber || ''}`.toLowerCase();
      if (!line.includes(filterKeyword)) return false;
    }
    return true;
  });

  if (displayed.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:25px; color:#64748b; font-size:13.5px;"><i class="fa-solid fa-list-check" style="font-size:20px; display:block; margin-bottom:8px; color:#cbd5e1;"></i>لا توجد إجراءات قضائية منفذة مطابقة لمعايير البحث الحالية.</td></tr>';
    return;
  }

  tbody.innerHTML = displayed.map(({ ev, h }, idx) => `
    <tr>
      <td style="font-weight:bold; text-align:center;">${idx + 1}</td>
      <td style="white-space:nowrap; font-weight:700;">${escapeHtml(h.date || '-')}</td>
      <td>
        <a href="javascript:void(0)" onclick="openPreviewModal('${ev.id}')" style="font-family:monospace; font-weight:800; color:#1e3a8a; text-decoration:underline;">
          ${escapeHtml(ev.evidenceNumber)}
        </a>
        <div style="font-size:11.5px; color:#0284c7; font-weight:bold;">قضية: ${escapeHtml(ev.caseNumber)}</div>
      </td>
      <td>
        <span class="badge-item-type">${escapeHtml(ev.itemType)}</span>
      </td>
      <td>
        <strong style="color:#0f172a; font-size:13px;">${escapeHtml(h.actionType)}</strong>
        <div style="margin-top:2px;"><span class="badge ${h.status === 'في المخزن' ? 'badge-in-custody' : 'badge-lab'}">${escapeHtml(h.status || '-')}</span></div>
      </td>
      <td>
        <div style="font-size:12px; color:#334155;">${escapeHtml(h.performedBy || '-')}</div>
        <small style="color:#64748b;">${escapeHtml(h.docRef || '-')}</small>
      </td>
      <td style="max-width:260px; word-break:break-word; font-size:12px;">
        <div>${escapeHtml(h.details || '-')}</div>
        ${h.saleAmount ? `<div style="font-size:11.5px; font-weight:800; color:#15803d; margin-top:2px;">قيمة البيع: ${Number(h.saleAmount).toLocaleString('ar-EG')} ج.م</div>` : ''}
        ${h.electronicPaymentNumber ? `<div style="font-size:11px; font-weight:bold; color:#0284c7;"><i class="fa-solid fa-credit-card"></i> مدفوعة: ${escapeHtml(h.electronicPaymentNumber)}</div>` : ''}
        ${h.settlementAccount ? `<div style="font-size:11px; color:#854d0e;"><i class="fa-solid fa-file-invoice-dollar"></i> تسوية: ${escapeHtml(h.settlementAccount)} ${h.transferNumber ? `(تحويل: ${escapeHtml(h.transferNumber)})` : ''}</div>` : ''}
        ${h.interiorEntity ? `<div style="font-size:11px; color:#1e40af;"><i class="fa-solid fa-building-shield"></i> جهة الداخلية: ${escapeHtml(h.interiorEntity)}</div>` : ''}
      </td>
      <td style="text-align:center; white-space:nowrap;">
        <div style="display:flex; gap:4px; justify-content:center;">
          <button type="button" class="btn-sm" style="background:#e0f2fe; color:#0369a1; padding:4px 8px; font-size:11.5px;" onclick="editProcedureDecision('${ev.id}', '${h.id}')" title="تعديل القرار">
            <i class="fa-solid fa-pen-to-square"></i> تعديل
          </button>
          <button type="button" class="btn-sm" style="background:#fee2e2; color:#b91c1c; padding:4px 8px; font-size:11.5px;" onclick="cancelProcedureDecision('${ev.id}', '${h.id}')" title="إلغاء القرار">
            <i class="fa-solid fa-trash-arrow-up"></i> إلغاء
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editProcedureDecision(evidenceId, historyId) {
  const ev = (typeof evidences !== 'undefined') ? evidences.find(e => e.id === evidenceId) : null;
  if (!ev || !Array.isArray(ev.history)) return;
  const h = ev.history.find(item => item.id === historyId);
  if (!h) return;

  const modal = document.getElementById('editProcedureModal');
  if (!modal) return;

  document.getElementById('editProcEvidenceId').value = ev.id;
  document.getElementById('editProcHistoryId').value = h.id;
  document.getElementById('editProcActionType').value = h.actionType;
  document.getElementById('editProcDate').value = h.date || '';
  document.getElementById('editProcDocRef').value = h.docRef || '';
  document.getElementById('editProcPerformedBy').value = h.performedBy || '';
  document.getElementById('editProcReceiptNumber').value = h.receiptNumber || '';
  document.getElementById('editProcElectronicPayment').value = h.electronicPaymentNumber || '';
  document.getElementById('editProcSettlement').value = h.settlementAccount || 'الخزانة العامة للدولة';
  document.getElementById('editProcTransferNumber').value = h.transferNumber || '';
  document.getElementById('editProcDetails').value = h.details || '';

  modal.style.display = 'flex';
}

function handleSaveEditedProcedure(event) {
  event.preventDefault();
  const evId = document.getElementById('editProcEvidenceId').value;
  const hId = document.getElementById('editProcHistoryId').value;

  const ev = (typeof evidences !== 'undefined') ? evidences.find(e => e.id === evId) : null;
  if (!ev || !Array.isArray(ev.history)) return;
  const h = ev.history.find(item => item.id === hId);
  if (!h) return;

  h.date = document.getElementById('editProcDate').value;
  h.docRef = document.getElementById('editProcDocRef').value.trim();
  h.performedBy = document.getElementById('editProcPerformedBy').value.trim();
  h.receiptNumber = document.getElementById('editProcReceiptNumber').value.trim();
  h.electronicPaymentNumber = document.getElementById('editProcElectronicPayment').value.trim();
  h.settlementAccount = document.getElementById('editProcSettlement').value;
  h.transferNumber = document.getElementById('editProcTransferNumber').value.trim();
  h.details = document.getElementById('editProcDetails').value.trim();

  saveEvidencesToStorage();
  closeModal('editProcedureModal');
  showToast('تم حفظ تعديلات القرار القضائي بنجاح');

  renderAllExecutedProceduresTable();
  if (activeProcedureEvidenceId === ev.id) {
    handleSelectProcedureEvidence(ev.id);
  }
}

function cancelProcedureDecision(evidenceId, historyId) {
  const ev = (typeof evidences !== 'undefined') ? evidences.find(e => e.id === evidenceId) : null;
  if (!ev || !Array.isArray(ev.history)) return;

  const idx = ev.history.findIndex(item => item.id === historyId);
  if (idx === -1) return;
  const h = ev.history[idx];

  const ok = confirm(`تأكيد الإلغاء:\nهل أنت متأكد من إلغاء القرار القضائي (${h.actionType}) المتخذ بتاريخ (${h.date}) للحرز رقم (${ev.evidenceNumber}) واسترجاع الحالة الدفترية السابقة؟`);
  if (!ok) return;

  ev.history.splice(idx, 1);

  if (ev.history.length > 0) {
    ev.status = ev.history[0].status || 'في المخزن';
    ev.lastModified = `${new Date().toISOString().split('T')[0]} (إلغاء إجراء)`;
  } else {
    ev.status = 'في المخزن';
    ev.lastModified = `${new Date().toISOString().split('T')[0]} (إلغاء كافة الإجراءات)`;
  }

  saveEvidencesToStorage();
  showToast(`تم إلغاء القرار القضائي واسترجاع حالة الحرز إلى (${ev.status}) بنجاح`);

  renderAllExecutedProceduresTable();
  if (activeProcedureEvidenceId === ev.id) {
    handleSelectProcedureEvidence(ev.id);
  }
  if (typeof updateDashboard === 'function') updateDashboard();
}

// ============================================================================
// MODULE 8: REBUILT COMPREHENSIVE ADMIN MONITORING REPORT (WITH SVG CHARTS)
// ============================================================================
function setAdminDashboardPeriod(period) {
  const startEl = document.getElementById('adminReportStartDate');
  const endEl = document.getElementById('adminReportEndDate');
  if (!startEl || !endEl) return;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  if (period === 'all') {
    startEl.value = '';
    endEl.value = '';
  } else if (period === 'this_year') {
    startEl.value = `${today.getFullYear()}-01-01`;
    endEl.value = todayStr;
  } else if (period === 'this_month') {
    const m = String(today.getMonth() + 1).padStart(2, '0');
    startEl.value = `${today.getFullYear()}-${m}-01`;
    endEl.value = todayStr;
  } else if (period === 'last_30_days') {
    const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    startEl.value = d30.toISOString().split('T')[0];
    endEl.value = todayStr;
  }

  renderAdminDashboard();
}

function printAdminDashboardReport() {
  const startDate = document.getElementById('adminReportStartDate')?.value || '';
  const endDate = document.getElementById('adminReportEndDate')?.value || '';

  const allEvs = (typeof getUserAccessibleEvidences === 'function') 
    ? getUserAccessibleEvidences() 
    : (typeof evidences !== 'undefined' ? evidences : []);

  // Filter evidences by date range
  const periodEvidences = allEvs.filter(ev => {
    const d = ev.seizureDate || ev.createdAt;
    if (startDate && d && d < startDate) return false;
    if (endDate && d && d > endDate) return false;
    return true;
  });

  const totalCount = periodEvidences.length;
  const inCustody = periodEvidences.filter(e => e.status === 'في المخزن').length;
  const inLab = periodEvidences.filter(e => e.status === 'مرسل للمعمل الجنائي').length;
  const sold = periodEvidences.filter(e => e.status === 'تم البيع').length;
  const interior = periodEvidences.filter(e => e.status === 'تم التسليم للداخلية').length;
  const destroyed = periodEvidences.filter(e => e.status === 'تم الإعدام بمحضر رسمي').length;
  const handedOwner = periodEvidences.filter(e => e.status === 'تم التسليم لصاحب الشأن').length;
  const finalCustody = periodEvidences.filter(e => e.status === 'محفوظ بصفة نهائية').length;

  // Remaining in custody list
  const remainingInCustodyList = periodEvidences.filter(e => e.status === 'في المخزن' || e.status === 'مرسل للمعمل الجنائي');

  // Collect all procedures executed within the period
  const executedProceduresList = [];
  let totalAuctionSalesSum = 0;

  periodEvidences.forEach(ev => {
    if (Array.isArray(ev.history)) {
      ev.history.forEach(h => {
        if (startDate && h.date && h.date < startDate) return;
        if (endDate && h.date && h.date > endDate) return;
        executedProceduresList.push({ ev, h });
        if (h.saleAmount) totalAuctionSalesSum += Number(h.saleAmount);
      });
    }
  });

  // Categories distribution
  const categories = [
    { name: 'مخدرات', code: 'DRG', color: '#dc2626' },
    { name: 'أسلحة وذخائر', code: 'WPN', color: '#475569' },
    { name: 'سيارات ومركبات', code: 'VEH', color: '#0284c7' },
    { name: 'أموال ونقد', code: 'CUR', color: '#16a34a' },
    { name: 'مصوغات ومشغولات', code: 'JWL', color: '#d97706' },
    { name: 'هواتف محمولة', code: 'PHN', color: '#7c3aed' },
    { name: 'أحراز تموينية', code: 'FOD', color: '#ca8a04' },
    { name: 'أجهزة ولابتوب', code: 'COM', color: '#0891b2' },
    { name: 'مستندات وأوراق', code: 'DOC', color: '#2563eb' },
    { name: 'أخرى', code: 'GEN', color: '#64748b' }
  ];

  const catCounts = categories.map(c => {
    const count = periodEvidences.filter(e => getItemTypeCode(e.itemType) === c.code).length;
    const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : 0;
    return { ...c, count, pct };
  });

  const periodTitle = (startDate || endDate) 
    ? `الفترة الزمنية من (${startDate || 'بداية القيد'}) إلى (${endDate || 'تاريخه'})`
    : 'عن كامل مدة السجلات المقيدة بالمنظومة القضائية';

  // SVG Bar Chart for Categories
  const svgCategoryChart = `
    <svg width="100%" height="210" viewBox="0 0 650 210" style="background:#ffffff; border:1px solid #000; margin:10px 0; font-family:'Cairo', sans-serif;">
      <text x="325" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">الرسم البياني لتوزيع الأحراز القضائية حسب التصنيف النوعي الرسمي</text>
      ${catCounts.map((cat, i) => {
        const x = 20 + (i * 62);
        const maxBarH = 120;
        const maxVal = Math.max(...catCounts.map(c => c.count), 1);
        const barH = Math.max(Math.round((cat.count / maxVal) * maxBarH), cat.count > 0 ? 6 : 0);
        const y = 165 - barH;
        return `
          <g>
            <rect x="${x}" y="${y}" width="44" height="${barH}" rx="3" fill="${cat.color}" />
            <text x="${x + 22}" y="${y - 5}" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#000">${cat.count}</text>
            <text x="${x + 22}" y="180" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#000">${cat.name}</text>
            <text x="${x + 22}" y="195" text-anchor="middle" font-size="8.5" fill="#444">(${cat.pct}%)</text>
          </g>
        `;
      }).join('')}
    </svg>
  `;

  // SVG Status Breakdown Horizontal Bars
  const statusBars = [
    { label: 'في المخزن (الأمانات)', count: inCustody, color: '#0284c7' },
    { label: 'مرسل للمعمل الجنائي', count: inLab, color: '#d97706' },
    { label: 'تم البيع بالمزاد', count: sold, color: '#15803d' },
    { label: 'تسليم لوزارة الداخلية', count: interior, color: '#1e40af' },
    { label: 'إعدام بمحضر رسمي', count: destroyed, color: '#dc2626' },
    { label: 'تسليم للمالك / المجني عليه', count: handedOwner, color: '#059669' },
    { label: 'محفوظ نهائياً', count: finalCustody, color: '#475569' }
  ];

  const svgStatusBarChart = `
    <svg width="100%" height="200" viewBox="0 0 650 200" style="background:#ffffff; border:1px solid #000; margin:10px 0; font-family:'Cairo', sans-serif;">
      <text x="325" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="#000">الرسم البياني للموقف الإجرائي الراهن للمضبوطات</text>
      ${statusBars.map((st, i) => {
        const y = 38 + (i * 22);
        const maxW = 320;
        const w = totalCount > 0 ? Math.round((st.count / totalCount) * maxW) : 0;
        return `
          <g>
            <text x="635" y="${y + 11}" text-anchor="end" font-size="10.5" font-weight="bold" fill="#000">${st.label}</text>
            <rect x="${635 - 190 - maxW}" y="${y}" width="${maxW}" height="14" rx="2" fill="#e5e7eb" />
            <rect x="${635 - 190 - w}" y="${y}" width="${w}" height="14" rx="2" fill="${st.color}" />
            <text x="${635 - 200 - maxW}" y="${y + 11}" text-anchor="end" font-size="10" font-weight="bold" fill="#000">${st.count} (${totalCount > 0 ? ((st.count / totalCount) * 100).toFixed(1) : 0}%)</text>
          </g>
        `;
      }).join('')}
    </svg>
  `;

  const reportHtml = `
    <div style="font-family:'Cairo', Tahoma, sans-serif; direction:rtl; text-align:right; padding:20px; background:#fff; color:#000;">
      <!-- Header -->
      <div style="border-bottom:2.5px solid #000; padding-bottom:12px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="font-size:12.5px; line-height:1.5; font-weight:bold;">
            جمهورية مصر العربية<br>
            النيابة العامة<br>
            مكتب السيد المستشار المحامي العام الأول<br>
            إدارة المتابعة والتفتيش الرقابي الشامل
          </div>
          <div style="text-align:center;">
            <h1 style="font-size:21px; margin:0; font-weight:900;">التقرير الرقابي الشامل لمستودع المضبوطات والأحراز</h1>
            <h3 style="font-size:13px; margin:4px 0; color:#1e3a8a;">${periodTitle}</h3>
            <div style="font-size:11px; font-weight:bold; border:1px solid #000; padding:2px 8px; display:inline-block; margin-top:4px;">
              بيان تحليلي مدعوم بالرسومات البيانية • حصر الأحراز المتبقية والإجراءات المنفذة
            </div>
          </div>
          <div style="font-size:12px; text-align:left; line-height:1.5;">
            <strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString('ar-EG')}<br>
            <strong>المحرر:</strong> ${currentUser ? currentUser.name : 'مدير النظام'}<br>
            <strong>رمز التوثيق:</strong> REP-${Date.now().toString().slice(-6)}
          </div>
        </div>
      </div>

      <!-- Summary KPI Table -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:12.5px; text-align:center;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="border:1.5px solid #000; padding:6px;">إجمالي الأحراز المقيدة</th>
            <th style="border:1.5px solid #000; padding:6px; background:#e0f2fe;">الأمانات بالمخزن</th>
            <th style="border:1.5px solid #000; padding:6px; background:#fef3c7;">المعمل الجنائي</th>
            <th style="border:1.5px solid #000; padding:6px; background:#dcfce7;">مبيعات المزاد</th>
            <th style="border:1.5px solid #000; padding:6px; background:#eff6ff;">تسليم الداخلية</th>
            <th style="border:1.5px solid #000; padding:6px; background:#fee2e2;">محاضر الإعدام</th>
            <th style="border:1.5px solid #000; padding:6px; background:#f0fdf4;">حصيلة المبيعات (ج.م)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="font-weight:bold; font-size:14px;">
            <td style="border:1.5px solid #000; padding:6px;">${totalCount} حرز</td>
            <td style="border:1.5px solid #000; padding:6px; color:#0369a1;">${inCustody}</td>
            <td style="border:1.5px solid #000; padding:6px; color:#b45309;">${inLab}</td>
            <td style="border:1.5px solid #000; padding:6px; color:#15803d;">${sold}</td>
            <td style="border:1.5px solid #000; padding:6px; color:#1e40af;">${interior}</td>
            <td style="border:1.5px solid #000; padding:6px; color:#b91c1c;">${destroyed}</td>
            <td style="border:1.5px solid #000; padding:6px; color:#15803d;">${totalAuctionSalesSum.toLocaleString('ar-EG')} ج.م</td>
          </tr>
        </tbody>
      </table>

      <!-- Graphical Charts Section -->
      <div style="margin-bottom:16px;">
        <h3 style="font-size:13.5px; font-weight:800; margin:6px 0 2px 0; border-bottom:1.5px solid #000; padding-bottom:4px;">
          أولاً: الرسوم البيانية الإحصائية للمضبوطات
        </h3>
        ${svgCategoryChart}
        ${svgStatusBarChart}
      </div>

      <!-- Remaining In-Custody Evidence Table -->
      <div style="margin-bottom:16px; page-break-before:auto;">
        <h3 style="font-size:13.5px; font-weight:800; margin:10px 0 4px 0; border-bottom:1.5px solid #000; padding-bottom:4px;">
          ثانياً: بيان الأحراز المتبقية بمستودع الأمانات والمعمل الجنائي (${remainingInCustodyList.length} حرز):
        </h3>
        <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:10px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #000; padding:4px; width:25px;">م</th>
              <th style="border:1px solid #000; padding:4px; width:120px;">رقم الحرز</th>
              <th style="border:1px solid #000; padding:4px; width:110px;">رقم القضية</th>
              <th style="border:1px solid #000; padding:4px; width:90px;">نوع الحرز</th>
              <th style="border:1px solid #000; padding:4px;">الوصف والحائز</th>
              <th style="border:1px solid #000; padding:4px; width:100px;">مكان الحفظ</th>
              <th style="border:1px solid #000; padding:4px; width:80px;">الحالة</th>
              <th style="border:1px solid #000; padding:4px; width:80px;">تاريخ الضبط</th>
            </tr>
          </thead>
          <tbody>
            ${remainingInCustodyList.length === 0 ? `<tr><td colspan="8" style="border:1px solid #000; padding:8px; text-align:center;">لا توجد أحراز متبقية خلال الفترة المحددة</td></tr>` : 
              remainingInCustodyList.slice(0, 50).map((e, idx) => `
                <tr>
                  <td style="border:1px solid #000; padding:3px; text-align:center;">${idx + 1}</td>
                  <td style="border:1px solid #000; padding:3px; font-family:monospace; font-weight:bold;">${escapeHtml(e.evidenceNumber)}</td>
                  <td style="border:1px solid #000; padding:3px;">${escapeHtml(e.caseNumber)}</td>
                  <td style="border:1px solid #000; padding:3px;">${escapeHtml(e.itemType)}</td>
                  <td style="border:1px solid #000; padding:3px;">${escapeHtml(e.description || '-')}</td>
                  <td style="border:1px solid #000; padding:3px;">${escapeHtml(e.storageLocation || '-')}</td>
                  <td style="border:1px solid #000; padding:3px; text-align:center;">${escapeHtml(e.status)}</td>
                  <td style="border:1px solid #000; padding:3px; text-align:center;">${escapeHtml(e.seizureDate || '-')}</td>
                </tr>
              `).join('')
            }
            ${remainingInCustodyList.length > 50 ? `<tr><td colspan="8" style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold;">... تم استعراض أول 50 حرزاً من إجمالي ${remainingInCustodyList.length} حرزاً</td></tr>` : ''}
          </tbody>
        </table>
      </div>

      <!-- All Procedures Executed In Period Table -->
      <div style="margin-bottom:16px;">
        <h3 style="font-size:13.5px; font-weight:800; margin:10px 0 4px 0; border-bottom:1.5px solid #000; padding-bottom:4px;">
          ثالثاً: بيان القرارات والإجراءات القضائية المنفذة (${executedProceduresList.length} إجراء):
        </h3>
        <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:14px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="border:1px solid #000; padding:4px; width:25px;">م</th>
              <th style="border:1px solid #000; padding:4px; width:75px;">التاريخ</th>
              <th style="border:1px solid #000; padding:4px; width:120px;">رقم الحرز والقضية</th>
              <th style="border:1px solid #000; padding:4px; width:120px;">الإجراء المنفذ</th>
              <th style="border:1px solid #000; padding:4px;">تفاصيل ومستند القرار</th>
              <th style="border:1px solid #000; padding:4px; width:100px;">المبالغ والتسويات</th>
              <th style="border:1px solid #000; padding:4px; width:100px;">اللجنة / المستلم</th>
            </tr>
          </thead>
          <tbody>
            ${executedProceduresList.length === 0 ? `<tr><td colspan="7" style="border:1px solid #000; padding:8px; text-align:center;">لا توجد إجراءات قضائية مسجلة خلال الفترة</td></tr>` :
              executedProceduresList.slice(0, 50).map(({ ev, h }, idx) => `
                <tr>
                  <td style="border:1px solid #000; padding:3px; text-align:center;">${idx + 1}</td>
                  <td style="border:1px solid #000; padding:3px; text-align:center;">${escapeHtml(h.date || '-')}</td>
                  <td style="border:1px solid #000; padding:3px;">
                    <div style="font-family:monospace; font-weight:bold;">${escapeHtml(ev.evidenceNumber)}</div>
                    <small>قضية: ${escapeHtml(ev.caseNumber)}</small>
                  </td>
                  <td style="border:1px solid #000; padding:3px; font-weight:bold;">${escapeHtml(h.actionType)}</td>
                  <td style="border:1px solid #000; padding:3px;">
                    <div>${escapeHtml(h.details || '-')}</div>
                    <small style="color:#444;">${escapeHtml(h.docRef || '')}</small>
                  </td>
                  <td style="border:1px solid #000; padding:3px; font-size:10px;">
                    ${h.saleAmount ? `<div><strong>${Number(h.saleAmount).toLocaleString('ar-EG')} ج.م</strong></div>` : ''}
                    ${h.electronicPaymentNumber ? `<div>دفع: ${escapeHtml(h.electronicPaymentNumber)}</div>` : ''}
                    ${h.transferNumber ? `<div>تحويل: ${escapeHtml(h.transferNumber)}</div>` : ''}
                    ${h.settlementAccount ? `<div>حساب: ${escapeHtml(h.settlementAccount)}</div>` : ''}
                  </td>
                  <td style="border:1px solid #000; padding:3px;">
                    ${escapeHtml(h.performedBy || h.interiorRepName || h.recipientName || '-')}
                  </td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>

      <!-- Signatures Block -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; text-align:center; font-size:12px; font-weight:bold; margin-top:25px;">
        <div style="border:1px solid #000; padding:10px;">
          أمين مستودع الأحراز<br><br><br>
          ........................................
        </div>
        <div style="border:1px solid #000; padding:10px;">
          مدير إدارة التفتيش والرقابة<br><br><br>
          ........................................
        </div>
        <div style="border:1px solid #000; padding:10px; background:#f8fafc;">
          رئيس النيابة الكلية والمحامي العام<br><br><br>
          ........................................
        </div>
      </div>
    </div>
  `;

  const printArea = document.getElementById('printReportArea');
  if (printArea) {
    printArea.innerHTML = reportHtml;
  }

  // Use reliable print mechanism without window.open popup block issues
  setTimeout(() => {
    try {
      window.print();
    } catch(e) {
      console.warn('Print error:', e);
    }
  }, 100);
}

// ============================================================================
// MODULE 9: UNIFIED CUSTOM REPORTS HUB (INVENTORY VIEW SUB-TAB 2)
// ============================================================================
function switchInventorySubTab(subTab = 'audit') {
  const secAudit = document.getElementById('invSubSectionAudit');
  const secReports = document.getElementById('invSubSectionReports');
  const btnAudit = document.getElementById('btnInvSubTabAudit');
  const btnReports = document.getElementById('btnInvSubTabReports');

  if (subTab === 'audit') {
    if (secAudit) secAudit.style.display = 'block';
    if (secReports) secReports.style.display = 'none';
    if (btnAudit) {
      btnAudit.style.background = '#c59b27';
      btnAudit.style.color = '#0b192c';
    }
    if (btnReports) {
      btnReports.style.background = 'rgba(255,255,255,0.15)';
      btnReports.style.color = '#ffffff';
    }
    renderInventoryAuditMetrics();
    renderInventoryAuditTable();
  } else {
    if (secAudit) secAudit.style.display = 'none';
    if (secReports) secReports.style.display = 'block';
    if (btnAudit) {
      btnAudit.style.background = 'rgba(255,255,255,0.15)';
      btnAudit.style.color = '#ffffff';
    }
    if (btnReports) {
      btnReports.style.background = '#c59b27';
      btnReports.style.color = '#0b192c';
    }
    generateCustomReportData();
  }
}

let activeGeneratedReportData = {
  type: 'sales',
  title: 'تقرير مبيعات المزاد',
  headers: [],
  rows: [],
  sumAmount: 0
};

function generateCustomReportData() {
  const type = document.getElementById('customReportTypeSelect')?.value || 'sales';
  const dateFrom = document.getElementById('customReportDateFrom')?.value || '';
  const dateTo = document.getElementById('customReportDateTo')?.value || '';
  const keyword = (document.getElementById('customReportKeyword')?.value || '').trim().toLowerCase();

  const allEvs = (typeof getUserAccessibleEvidences === 'function') 
    ? getUserAccessibleEvidences() 
    : (typeof evidences !== 'undefined' ? evidences : []);

  let headers = [];
  let rows = [];
  let sumAmount = 0;
  let reportTitle = '';

  if (type === 'sales') {
    reportTitle = 'تقرير الأحراز المباعة بالمزاد العلني وأسعارها وتوريداتها وبيانات التسوية';
    headers = ['م', 'رقم الحرز', 'رقم القضية', 'النيابة المختصة', 'نوع الحرز', 'تاريخ البيع', 'قيمة البيع (ج.م)', 'رقم الدفع الإلكتروني', 'بيان تسوية الحساب', 'رقم التحويل البنكي', 'اللجنة'];
    
    allEvs.forEach(ev => {
      if (Array.isArray(ev.history)) {
        ev.history.forEach(h => {
          if (h.actionType?.includes('بيع بالمزاد') || h.actionType?.includes('بيع')) {
            if (dateFrom && h.date < dateFrom) return;
            if (dateTo && h.date > dateTo) return;
            if (keyword) {
              const str = `${ev.evidenceNumber} ${ev.caseNumber} ${h.electronicPaymentNumber || ''} ${h.transferNumber || ''} ${h.settlementAccount || ''} ${ev.partialProsecution || ''}`.toLowerCase();
              if (!str.includes(keyword)) return;
            }
            const amt = Number(h.saleAmount) || 0;
            sumAmount += amt;
            rows.push([
              rows.length + 1,
              ev.evidenceNumber,
              ev.caseNumber,
              ev.partialProsecution || ev.appealProsecution || '-',
              ev.itemType,
              h.date || '-',
              `${amt.toLocaleString('ar-EG')} ج.م`,
              h.electronicPaymentNumber || '-',
              h.settlementAccount || 'الخزانة العامة للدولة',
              h.transferNumber || '-',
              h.performedBy || '-'
            ]);
          }
        });
      }
    });
  } else if (type === 'interior') {
    reportTitle = 'تقرير تسليم الأحراز والمضبوطات إلى وزارة الداخلية';
    headers = ['م', 'رقم الحرز', 'رقم القضية', 'نوع الحرز', 'تاريخ التسليم', 'قطاع الداخلية المستلم', 'المندوب ورتبته', 'الرقم القومي للمندوب', 'رقم المحضر / الخطاب'];

    allEvs.forEach(ev => {
      if (Array.isArray(ev.history)) {
        ev.history.forEach(h => {
          if (h.actionType?.includes('الداخلية') || h.actionType?.includes('تسليم الحرز إلى وزارة الداخلية')) {
            if (dateFrom && h.date < dateFrom) return;
            if (dateTo && h.date > dateTo) return;
            if (keyword) {
              const str = `${ev.evidenceNumber} ${ev.caseNumber} ${h.interiorEntity || ''} ${h.interiorRepName || ''} ${h.interiorRepNationalId || ''}`.toLowerCase();
              if (!str.includes(keyword)) return;
            }
            rows.push([
              rows.length + 1,
              ev.evidenceNumber,
              ev.caseNumber,
              ev.itemType,
              h.date || '-',
              h.interiorEntity || 'قطاع الأمن العام',
              `${h.interiorRepName || '-'}${h.interiorRepRank ? ' (' + h.interiorRepRank + ')' : ''}`,
              h.interiorRepNationalId || '-',
              h.interiorReceiptMinute || h.interiorDocRef || '-'
            ]);
          }
        });
      }
    });
  } else if (type === 'destruction') {
    reportTitle = 'تقرير محاضر وقرارات إعدام وإتلاف المضبوطات';
    headers = ['م', 'رقم الحرز', 'رقم القضية', 'نوع الحرز', 'تاريخ الإعدام', 'طريقة الإتلاف', 'رقم محضر الإعدام', 'لجنة الإشراف'];

    allEvs.forEach(ev => {
      if (Array.isArray(ev.history)) {
        ev.history.forEach(h => {
          if (h.actionType?.includes('إعدام') || h.actionType?.includes('إتلاف')) {
            if (dateFrom && h.date < dateFrom) return;
            if (dateTo && h.date > dateTo) return;
            if (keyword) {
              const str = `${ev.evidenceNumber} ${ev.caseNumber} ${h.destructionMethod || ''} ${h.destructionMinute || ''}`.toLowerCase();
              if (!str.includes(keyword)) return;
            }
            rows.push([
              rows.length + 1,
              ev.evidenceNumber,
              ev.caseNumber,
              ev.itemType,
              h.date || '-',
              h.destructionMethod || 'حرق بالمحرقة الرسمية',
              h.destructionMinute || h.docRef || '-',
              h.performedBy || '-'
            ]);
          }
        });
      }
    });
  } else if (type === 'food_expiry') {
    reportTitle = 'تقرير السلع والأحراز التموينية وتواريخ الصلاحية وتنبيهات القرب من التلف';
    headers = ['م', 'رقم الحرز', 'رقم القضية', 'الوصف', 'تاريخ الإنتاج', 'تاريخ انتهاء الصلاحية', 'الأيام المتبقية', 'الموقف الرقابي'];

    const now = new Date();
    allEvs.filter(e => e.itemType === 'أحراز تموينية' || e.itemType === 'سلع تموينية' || e.foodExpiryDate).forEach(ev => {
      const d = ev.seizureDate || ev.createdAt;
      if (dateFrom && d < dateFrom) return;
      if (dateTo && d > dateTo) return;
      if (keyword) {
        const str = `${ev.evidenceNumber} ${ev.caseNumber} ${ev.description || ''} ${ev.foodBatchNumber || ''}`.toLowerCase();
        if (!str.includes(keyword)) return;
      }

      let diffDays = '-';
      let alertBadge = '<span class="badge" style="background:#16a34a; color:#fff;">سارية</span>';
      if (ev.foodExpiryDate) {
        const exp = new Date(ev.foodExpiryDate);
        diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          alertBadge = `<span class="badge" style="background:#dc2626; color:#fff;">منتهية الصلاحية منذ ${Math.abs(diffDays)} يوماً</span>`;
        } else if (diffDays <= 7) {
          alertBadge = `<span class="badge" style="background:#ca8a04; color:#fff;">أوشكت على الانتهاء (${diffDays} أيام)</span>`;
        } else {
          alertBadge = `<span class="badge" style="background:#16a34a; color:#fff;">متبقي ${diffDays} يوماً</span>`;
        }
      }

      rows.push([
        rows.length + 1,
        ev.evidenceNumber,
        ev.caseNumber,
        ev.description || 'سلع تموينية',
        ev.foodProductionDate || '-',
        ev.foodExpiryDate || '-',
        diffDays,
        alertBadge
      ]);
    });
  } else if (type === 'weapons') {
    reportTitle = 'تقرير الأسلحة والذخائر المضبوطة (تصنيف: سلاح أبيض / سلاح ناري)';
    headers = ['م', 'رقم الحرز', 'رقم القضية', 'تصنيف السلاح', 'العيار والنوع', 'الرقم المسلسل', 'حالة السلاح', 'مكان الحفظ'];

    allEvs.filter(e => e.itemType === 'أسلحة وذخائر' || e.weaponCategory).forEach(ev => {
      const d = ev.seizureDate || ev.createdAt;
      if (dateFrom && d < dateFrom) return;
      if (dateTo && d > dateTo) return;
      if (keyword) {
        const str = `${ev.evidenceNumber} ${ev.caseNumber} ${ev.weaponCategory || ''} ${ev.weaponSerial || ''} ${ev.weaponCaliber || ''}`.toLowerCase();
        if (!str.includes(keyword)) return;
      }

      rows.push([
        rows.length + 1,
        ev.evidenceNumber,
        ev.caseNumber,
        ev.weaponCategory || 'سلاح ناري',
        ev.weaponCaliber || '-',
        ev.weaponSerial || '-',
        ev.weaponCondition || 'سليم وصالح للاستعمال',
        ev.storageLocation || 'مخزن الأسلحة'
      ]);
    });
  } else if (type === 'phones') {
    reportTitle = 'تقرير الهواتف المحمولة والأجهزة الذكية والسيريال نمبر (IMEI)';
    headers = ['م', 'رقم الحرز', 'رقم القضية', 'نوع وموديل الهاتف', 'الرقم المسلسل / IMEI', 'اللون والرمز', 'الحالة والموضع'];

    allEvs.filter(e => e.itemType === 'هواتف محمولة' || e.phoneImeiSerial).forEach(ev => {
      const d = ev.seizureDate || ev.createdAt;
      if (dateFrom && d < dateFrom) return;
      if (dateTo && d > dateTo) return;
      if (keyword) {
        const str = `${ev.evidenceNumber} ${ev.caseNumber} ${ev.phoneBrandModel || ''} ${ev.phoneImeiSerial || ''}`.toLowerCase();
        if (!str.includes(keyword)) return;
      }

      rows.push([
        rows.length + 1,
        ev.evidenceNumber,
        ev.caseNumber,
        ev.phoneBrandModel || 'هاتف محمول',
        ev.phoneImeiSerial || '-',
        `${ev.phoneColor || '-'} ${ev.phonePassword ? '(رمز: ' + ev.phonePassword + ')' : ''}`,
        `${ev.status} (${ev.storageLocation || 'الخزينة'})`
      ]);
    });
  } else if (type === 'owners') {
    reportTitle = 'تقرير تسليم الأحراز والمضبوطات للمجني عليهم والمالكين الشرعيين';
    headers = ['م', 'رقم الحرز', 'رقم القضية', 'نوع الحرز', 'تاريخ التسليم', 'اسم المستلم', 'الرقم القومي', 'بيان وسند التسليم'];

    allEvs.forEach(ev => {
      if (Array.isArray(ev.history)) {
        ev.history.forEach(h => {
          if (h.actionType?.includes('تسليم للمجني') || h.actionType?.includes('مالكه')) {
            if (dateFrom && h.date < dateFrom) return;
            if (dateTo && h.date > dateTo) return;
            if (keyword) {
              const str = `${ev.evidenceNumber} ${ev.caseNumber} ${h.recipientName || ''} ${h.recipientNationalId || ''}`.toLowerCase();
              if (!str.includes(keyword)) return;
            }
            rows.push([
              rows.length + 1,
              ev.evidenceNumber,
              ev.caseNumber,
              ev.itemType,
              h.date || '-',
              h.recipientName || '-',
              h.recipientNationalId || '-',
              h.docRef || h.details || '-'
            ]);
          }
        });
      }
    });
  } else if (type === 'forensics') {
    reportTitle = 'تقرير إرسال المضبوطات للمعمل الجنائي والطب الشرعي';
    headers = ['م', 'رقم الحرز', 'رقم القضية', 'نوع الحرز', 'تاريخ الإرسال', 'الجهة المرسل إليها', 'السند ورقم المذكرة'];

    allEvs.forEach(ev => {
      if (Array.isArray(ev.history)) {
        ev.history.forEach(h => {
          if (h.actionType?.includes('معمل') || h.actionType?.includes('طب شرعي') || ev.status === 'مرسل للمعمل الجنائي') {
            if (dateFrom && h.date < dateFrom) return;
            if (dateTo && h.date > dateTo) return;
            if (keyword) {
              const str = `${ev.evidenceNumber} ${ev.caseNumber} ${h.actionType || ''}`.toLowerCase();
              if (!str.includes(keyword)) return;
            }
            rows.push([
              rows.length + 1,
              ev.evidenceNumber,
              ev.caseNumber,
              ev.itemType,
              h.date || '-',
              'مصلحة الأدلة الجنائية / الطب الشرعي',
              h.docRef || '-'
            ]);
          }
        });
      }
    });
  } else if (type === 'all_actions') {
    reportTitle = 'تقرير شامل لكافة الإجراءات والقرارات القضائية المنفذة';
    headers = ['م', 'رقم الحرز', 'رقم القضية', 'نوع الحرز', 'تاريخ الإجراء', 'نوع الإجراء', 'الحالة', 'القائم بالإجراء'];

    allEvs.forEach(ev => {
      if (Array.isArray(ev.history)) {
        ev.history.forEach(h => {
          if (dateFrom && h.date < dateFrom) return;
          if (dateTo && h.date > dateTo) return;
          if (keyword) {
            const str = `${ev.evidenceNumber} ${ev.caseNumber} ${h.actionType || ''} ${h.performedBy || ''}`.toLowerCase();
            if (!str.includes(keyword)) return;
          }
          rows.push([
            rows.length + 1,
            ev.evidenceNumber,
            ev.caseNumber,
            ev.itemType,
            h.date || '-',
            h.actionType,
            h.status || '-',
            h.performedBy || '-'
          ]);
        });
      }
    });
  } else {
    // Inventory by date
    reportTitle = 'تقرير جرد المستودع حسب تاريخ الضبط والقيد';
    headers = ['م', 'رقم الحرز', 'رقم القضية', 'النيابة', 'نوع الحرز', 'مكان الحفظ', 'الحالة', 'تاريخ الضبط'];

    allEvs.forEach(ev => {
      const d = ev.seizureDate || ev.createdAt;
      if (dateFrom && d < dateFrom) return;
      if (dateTo && d > dateTo) return;
      if (keyword) {
        const str = `${ev.evidenceNumber} ${ev.caseNumber} ${ev.itemType} ${ev.storageLocation || ''}`.toLowerCase();
        if (!str.includes(keyword)) return;
      }
      rows.push([
        rows.length + 1,
        ev.evidenceNumber,
        ev.caseNumber,
        ev.partialProsecution || '-',
        ev.itemType,
        ev.storageLocation || '-',
        ev.status,
        ev.seizureDate || '-'
      ]);
    });
  }

  activeGeneratedReportData = {
    type,
    title: reportTitle,
    headers,
    rows,
    sumAmount,
    dateFrom,
    dateTo
  };

  // Render to custom report table
  const thead = document.getElementById('customReportTableHead');
  const tbody = document.getElementById('customReportTableBody');
  const countBadge = document.getElementById('customReportCountBadge');
  const sumBadge = document.getElementById('customReportSumBadge');

  if (countBadge) countBadge.textContent = `${rows.length} سجل مطابق`;
  if (sumBadge) {
    if (sumAmount > 0) {
      sumBadge.textContent = `إجمالي الحصيلة: ${sumAmount.toLocaleString('ar-EG')} ج.م`;
      sumBadge.style.display = 'inline-block';
    } else {
      sumBadge.style.display = 'none';
    }
  }

  if (thead) {
    thead.innerHTML = `<tr>${headers.map(h => `<th style="padding:8px;">${escapeHtml(h)}</th>`).join('')}</tr>`;
  }
  if (tbody) {
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${headers.length}" style="text-align:center; padding:25px; color:#64748b;">لا توجد سجلات مطابقة للتقرير المطلوب خلال الفترة المحددة</td></tr>`;
    } else {
      tbody.innerHTML = rows.map(r => `
        <tr>
          ${r.map((cell, ci) => `
            <td style="padding:6px; ${ci === 1 ? 'font-family:monospace; font-weight:bold;' : ''}">
              ${String(cell).startsWith('<span') ? cell : escapeHtml(String(cell))}
            </td>
          `).join('')}
        </tr>
      `).join('');
    }
  }
}

function printGeneratedCustomReport() {
  const rep = activeGeneratedReportData;
  if (!rep || rep.rows.length === 0) {
    showToast('لا توجد بيانات متاحة لطباعة التقرير', true);
    return;
  }

  const periodText = (rep.dateFrom || rep.dateTo) 
    ? `الفترة من: ${rep.dateFrom || 'البداية'} إلى: ${rep.dateTo || 'تاريخه'}` 
    : 'كافة الفترات المقيدة';

  const reportHtml = `
    <div style="font-family:'Cairo', Tahoma, sans-serif; direction:rtl; text-align:right; padding:20px; background:#fff; color:#000;">
      <!-- Header -->
      <div style="border-bottom:2.5px solid #000; padding-bottom:12px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="font-size:12.5px; line-height:1.4; font-weight:bold;">
            جمهورية مصر العربية<br>
            النيابة العامة المصرية<br>
            إدارة النيابات والتفتيش القضائي
          </div>
          <div style="text-align:center;">
            <h1 style="font-size:20px; margin:0; font-weight:900;">${escapeHtml(rep.title)}</h1>
            <div style="font-size:12px; font-weight:bold; margin-top:4px;">${periodText}</div>
          </div>
          <div style="font-size:12px; text-align:left; line-height:1.4;">
            <strong>تاريخ الاستخراج:</strong> ${new Date().toLocaleDateString('ar-EG')}<br>
            <strong>عدد السجلات:</strong> ${rep.rows.length}<br>
            ${rep.sumAmount ? `<strong>إجمالي المبلغ:</strong> ${rep.sumAmount.toLocaleString('ar-EG')} ج.م` : ''}
          </div>
        </div>
      </div>

      <!-- Table -->
      <table style="width:100%; border-collapse:collapse; font-size:11.5px; margin-bottom:18px;">
        <thead>
          <tr style="background:#f1f5f9;">
            ${rep.headers.map(h => `<th style="border:1px solid #000; padding:6px; font-weight:bold;">${escapeHtml(h)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rep.rows.map(r => `
            <tr>
              ${r.map(c => `<td style="border:1px solid #000; padding:5px;">${String(c).replace(/<[^>]*>?/gm, '')}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Signatures -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; text-align:center; font-size:12px; font-weight:bold; margin-top:30px;">
        <div style="border:1px solid #000; padding:10px;">
          الموظف المختص<br><br><br>
          ........................................
        </div>
        <div style="border:1px solid #000; padding:10px;">
          أمين مستودع الأحراز<br><br><br>
          ........................................
        </div>
        <div style="border:1px solid #000; padding:10px; background:#f8fafc;">
          رئيس النيابة المشرف<br><br><br>
          ........................................
        </div>
      </div>
    </div>
  `;

  const printArea = document.getElementById('printReportArea');
  if (printArea) {
    printArea.innerHTML = reportHtml;
  }

  try {
    const printWin = window.open('', '_blank', 'width=900,height=750');
    if (printWin && !printWin.closed) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <title>${escapeHtml(rep.title)}</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800;900&display=swap">
          <style>
            @page { size: A4 landscape; margin: 8mm; }
            body { margin: 0; padding: 0; background: #fff; font-family: 'Cairo', Tahoma, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; }
          </style>
        </head>
        <body>
          ${reportHtml}
        </body>
        </html>
      `);
      printWin.document.close();
      setTimeout(() => {
        try {
          printWin.focus();
          printWin.print();
        } catch(e) {
          window.print();
        }
      }, 350);
      return;
    }
  } catch(e) {}

  setTimeout(() => {
    window.print();
  }, 150);
}

function exportGeneratedCustomReportToExcel() {
  const rep = (typeof activeGeneratedReportData !== 'undefined') ? activeGeneratedReportData : null;
  if (!rep || !rep.rows || rep.rows.length === 0) {
    if (typeof showToast === 'function') {
      showToast('لا توجد بيانات لتصديرها إلى Excel', true);
    } else {
      alert('لا توجد بيانات لتصديرها إلى Excel');
    }
    return;
  }

  // Clean data: remove any HTML tags (e.g. badges, spans) from cell contents
  const cleanHeaders = rep.headers.map(h => String(h || '').trim());
  const cleanRows = rep.rows.map(row => 
    row.map(cell => String(cell != null ? cell : '').replace(/<[^>]*>?/gm, '').trim())
  );

  const cleanTitle = (rep.title || 'تقرير_مخصص').replace(/[^\u0600-\u06FF\w\s-]/gi, '').trim().replace(/\s+/g, '_');
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `${cleanTitle}_${dateStr}.xlsx`;

  // Prefer XLSX if available
  if (typeof XLSX !== 'undefined') {
    try {
      const allRows = [cleanHeaders, ...cleanRows];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(allRows);

      // Set optimal column widths
      ws['!cols'] = cleanHeaders.map((h, colIdx) => {
        let maxLen = h.length;
        cleanRows.forEach(r => {
          const val = r[colIdx] || '';
          if (val.length > maxLen) maxLen = val.length;
        });
        return { wch: Math.min(Math.max(maxLen + 4, 12), 45) };
      });

      // Enable native AutoFilter
      const totalCols = cleanHeaders.length;
      const totalRows = allRows.length;
      if (totalCols > 0 && totalRows > 1) {
        const lastColLetter = XLSX.utils.encode_col(totalCols - 1);
        ws['!autofilter'] = { ref: `A1:${lastColLetter}${totalRows}` };
      }

      // RTL view for Arabic Excel sheets
      ws['!views'] = [{ RTL: true, showGridLines: true }];

      XLSX.utils.book_append_sheet(wb, ws, cleanTitle.substring(0, 31) || "تقرير");
      XLSX.writeFile(wb, fileName);

      if (typeof showToast === 'function') {
        showToast(`تم تصدير تقرير (${rep.title}) إلى Excel (.xlsx) بنجاح`);
      }
      return;
    } catch (err) {
      console.warn('XLSX export failed, falling back to CSV export:', err);
    }
  }

  // Fallback to CSV with UTF-8 BOM
  let csvContent = "\uFEFF"; // UTF-8 BOM
  csvContent += cleanHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";
  cleanRows.forEach(r => {
    csvContent += r.map(c => `"${c.replace(/"/g, '""')}"`).join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${cleanTitle}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  if (typeof showToast === 'function') {
    showToast(`تم تصدير تقرير (${rep.title}) بنجاح بصيغة CSV / Excel`);
  }
}

// Global aliases for both names - direct reference to eliminate any chance of recursion
if (typeof window !== 'undefined') {
  window.exportGeneratedCustomReportToExcel = exportGeneratedCustomReportToExcel;
  window.exportCustomReportToExcel = exportGeneratedCustomReportToExcel;
}

