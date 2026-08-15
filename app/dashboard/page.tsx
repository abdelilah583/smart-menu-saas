'use client';
import { supabase } from '@/lib/supabase/client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Trash2,
  Edit2,
  Utensils,
  FolderPlus,
  X,
  QrCode,
  GripVertical,
  LogOut,
  Search,
  Copy,
  Check,
  Plus,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// --- قاموس الترجمات للغات الثلاث ---
const translations = {
  ar: {
    dashboardTitle: 'لوحة تحكم المنصة',
    currentCafe: 'المطعم الحالي:',
    qrCode: 'QR Code القائمة',
    menuSections: 'أقسام القائمة',
    dishesAndProducts: 'الأطباق والمنتجات',
    sectionNamePlaceholder: 'اسم القسم الجديد',
    editSectionPlaceholder: 'تعديل القسم...',
    sectionNameArPlaceholder: 'اسم القسم بالعربية (إلزامي)',
    sectionNameFrPlaceholder: 'بالفرنسية (اختياري)',
    sectionNameEnPlaceholder: 'بالإنجليزية (اختياري)',
    add: 'إضافة',
    save: 'حفظ',
    cancel: 'إلغاء',
    addNewDish: 'إضافة طبق جديد',
    editDishTitle: 'تعديل الطبق',
    cancelEdit: 'إلغاء التعديل',
    dishNameAr: 'اسم الطبق (العربية) *',
    dishNameFr: 'اسم الطبق (الفرنسية)',
    dishNameEn: 'اسم الطبق (الإنجليزية)',
    descAr: 'الوصف (العربية)',
    descFr: 'الوصف (الفرنسية)',
    descEn: 'الوصف (الإنجليزية)',
    price: 'السعر *',
    dishImage: 'صورة الطبق',
    available: 'متوفر:',
    yes: 'نعم',
    no: 'لا',
    addDishBtn: 'إضافة الطبق للقائمة',
    saveDishBtn: 'حفظ تعديلات الطبق',
    loading: 'جاري التحميل...',
    uploading: 'جاري الرفع والحفظ...',
    noDishes: 'لا توجد أطباق في هذا القسم بعد.',
    noDishesMatch: 'لا توجد أطباق مطابقة لبحثك.',
    selectSectionMsg: 'الرجاء اختيار أو إنشاء قسم لعرض أطباقه.',
    noImage: 'لا توجد',
    unavailable: 'غير متوفر',
    deleteSectionConfirm: 'هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الأطباق داخله أيضاً.',
    deleteDishConfirm: 'هل أنت متأكد من رغبتك في حذف هذا الطبق؟',
    createCafePrompt: 'أنشئ مطعمك الأول للبدء',
    cafeNamePlaceholder: 'اسم المطعم أو المقهى',
    createBtn: 'إنشاء',
    downloadHighQuality: 'تحميل الصورة بجودة عالية',
    scanQrTitle: 'رمز الاستجابة السريعة (QR)',
    scanQrDesc: 'امسح الرمز لاستعراض قائمة',
    editCafeNameTitle: 'تعديل اسم المطعم',
    cafeNameLabel: 'اسم المطعم الجديد',
    saveCafeName: 'حفظ الاسم',
    noFileChosen: 'لم يتم اختيار ملف',
    logout: 'تسجيل الخروج',
    searchDishes: 'بحث عن طبق...',
    copyLink: 'نسخ الرابط',
    linkCopied: 'تم نسخ الرابط!',
    fileTooLarge: 'حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت.',
    invalidFileType: 'صيغة الملف غير مدعومة. الرجاء اختيار صورة (JPG, PNG, WEBP).',
    cafeCreated: 'تم إنشاء المطعم بنجاح',
    cafeNameUpdated: 'تم تحديث اسم المطعم',
    sectionSaved: 'تم حفظ القسم بنجاح',
    sectionDeleted: 'تم حذف القسم',
    dishSaved: 'تم حفظ الطبق بنجاح',
    dishDeleted: 'تم حذف الطبق',
    genericError: 'حدث خطأ، حاول مرة أخرى',
    addNewSection: 'إضافة قسم جديد',
    deleteConfirmTitle: 'تأكيد الحذف',
    deleteConfirmOk: 'حذف',
    cannotUndo: 'لا يمكن التراجع عن هذا الإجراء.',
    removeImage: 'إزالة الصورة',
    editTooltip: 'تعديل',
    deleteTooltip: 'حذف',
    dragToReorder: 'اسحب لإعادة الترتيب',
    currency: 'د.م',
    dishCountLabel: 'عدد الأطباق',
    sectionNameRequiredError: 'يرجى إدخال اسم القسم بالعربية على الأقل.',
    dishNameRequiredError: 'الرجاء إدخال اسم الطبق بالعربية.',
    priceInvalidError: 'الرجاء إدخال سعر صحيح.',
    selectSectionError: 'الرجاء اختيار قسم.',
  },
  fr: {
    dashboardTitle: 'Tableau de bord',
    currentCafe: 'Restaurant actuel :',
    qrCode: 'Code QR du Menu',
    menuSections: 'Sections du Menu',
    dishesAndProducts: 'Plats et Produits',
    sectionNamePlaceholder: 'Nom de la nouvelle section',
    editSectionPlaceholder: 'Modifier la section...',
    sectionNameArPlaceholder: 'Nom de la section (Arabe - Requis)',
    sectionNameFrPlaceholder: 'Français (Optionnel)',
    sectionNameEnPlaceholder: 'Anglais (Optionnel)',
    add: 'Ajouter',
    save: 'Enregistrer',
    cancel: 'Annuler',
    addNewDish: 'Ajouter un nouveau plat',
    editDishTitle: 'Modifier le plat',
    cancelEdit: 'Annuler la modification',
    dishNameAr: 'Nom du plat (Arabe) *',
    dishNameFr: 'Nom du plat (Français)',
    dishNameEn: 'Nom du plat (Anglais)',
    descAr: 'Description (Arabe)',
    descFr: 'Description (Française)',
    descEn: 'Description (Anglaise)',
    price: 'Prix *',
    dishImage: 'Image du plat',
    available: 'Disponible :',
    yes: 'Oui',
    no: 'Non',
    addDishBtn: 'Ajouter au menu',
    saveDishBtn: 'Enregistrer les modifications',
    loading: 'Chargement...',
    uploading: 'Téléchargement...',
    noDishes: 'Aucun plat dans cette section pour le moment.',
    noDishesMatch: 'Aucun plat ne correspond à votre recherche.',
    selectSectionMsg: 'Veuillez sélectionner ou créer une section pour afficher ses plats.',
    noImage: 'Aucune',
    unavailable: 'Indisponible',
    deleteSectionConfirm: "Êtes-vous sûr de vouloir supprimer cette section ? Tous les plats qu'ils contiennent seront également supprimés.",
    deleteDishConfirm: 'Êtes-vous sûr de vouloir supprimer ce plat ?',
    createCafePrompt: 'Créez votre premier restaurant pour commencer',
    cafeNamePlaceholder: 'Nom du restaurant ou café',
    createBtn: 'Créer',
    downloadHighQuality: 'Télécharger en haute qualité',
    scanQrTitle: 'Code QR du Menu',
    scanQrDesc: 'Scannez le code pour afficher le menu de',
    editCafeNameTitle: 'Modifier le nom du restaurant',
    cafeNameLabel: 'Nouveau nom du restaurant',
    saveCafeName: 'Enregistrer le nom',
    noFileChosen: 'Aucun fichier choisi',
    logout: 'Déconnexion',
    searchDishes: 'Rechercher un plat...',
    copyLink: 'Copier le lien',
    linkCopied: 'Lien copié !',
    fileTooLarge: "L'image est trop volumineuse. Taille maximale : 2 Mo.",
    invalidFileType: 'Format non supporté. Choisissez une image (JPG, PNG, WEBP).',
    cafeCreated: 'Restaurant créé avec succès',
    cafeNameUpdated: 'Nom du restaurant mis à jour',
    sectionSaved: 'Section enregistrée avec succès',
    sectionDeleted: 'Section supprimée',
    dishSaved: 'Plat enregistré avec succès',
    dishDeleted: 'Plat supprimé',
    genericError: 'Une erreur est survenue, réessayez',
    addNewSection: 'Ajouter une section',
    deleteConfirmTitle: 'Confirmer la suppression',
    deleteConfirmOk: 'Supprimer',
    cannotUndo: 'Cette action est irréversible.',
    removeImage: "Retirer l'image",
    editTooltip: 'Modifier',
    deleteTooltip: 'Supprimer',
    dragToReorder: 'Glisser pour réorganiser',
    currency: 'DH',
    dishCountLabel: 'Nombre de plats',
    sectionNameRequiredError: 'Veuillez saisir le nom de la section en arabe.',
    dishNameRequiredError: 'Veuillez saisir le nom du plat en arabe.',
    priceInvalidError: 'Veuillez saisir un prix valide.',
    selectSectionError: 'Veuillez sélectionner une section.',
  },
  en: {
    dashboardTitle: 'Dashboard',
    currentCafe: 'Current Restaurant:',
    qrCode: 'Menu QR Code',
    menuSections: 'Menu Sections',
    dishesAndProducts: 'Dishes & Products',
    sectionNamePlaceholder: 'New Section Name',
    editSectionPlaceholder: 'Edit Section...',
    sectionNameArPlaceholder: 'Section Name (Arabic - Required)',
    sectionNameFrPlaceholder: 'French (Optional)',
    sectionNameEnPlaceholder: 'English (Optional)',
    add: 'Add',
    save: 'Save',
    cancel: 'Cancel',
    addNewDish: 'Add New Dish',
    editDishTitle: 'Edit Dish',
    cancelEdit: 'Cancel Edit',
    dishNameAr: 'Dish Name (Arabic) *',
    dishNameFr: 'Dish Name (French)',
    dishNameEn: 'Dish Name (English)',
    descAr: 'Description (Arabic)',
    descFr: 'Description (French)',
    descEn: 'Description (English)',
    price: 'Price *',
    dishImage: 'Dish Image',
    available: 'Available:',
    yes: 'Yes',
    no: 'No',
    addDishBtn: 'Add Dish to Menu',
    saveDishBtn: 'Save Dish Changes',
    loading: 'Loading...',
    uploading: 'Uploading...',
    noDishes: 'No dishes in this section yet.',
    noDishesMatch: 'No dishes match your search.',
    selectSectionMsg: 'Please select or create a section to view its dishes.',
    noImage: 'None',
    unavailable: 'Unavailable',
    deleteSectionConfirm: 'Are you sure you want to delete this section? All dishes inside it will also be deleted.',
    deleteDishConfirm: 'Are you sure you want to delete this dish?',
    createCafePrompt: 'Create your first restaurant to start',
    cafeNamePlaceholder: 'Restaurant or Cafe Name',
    createBtn: 'Create',
    downloadHighQuality: 'Download High Quality Image',
    scanQrTitle: 'Menu QR Code',
    scanQrDesc: 'Scan the code to view the menu of',
    editCafeNameTitle: 'Edit Restaurant Name',
    cafeNameLabel: 'New Restaurant Name',
    saveCafeName: 'Save Name',
    noFileChosen: 'No file chosen',
    logout: 'Logout',
    searchDishes: 'Search dishes...',
    copyLink: 'Copy Link',
    linkCopied: 'Link copied!',
    fileTooLarge: 'Image is too large. Maximum size is 2MB.',
    invalidFileType: 'Unsupported file type. Please choose an image (JPG, PNG, WEBP).',
    cafeCreated: 'Restaurant created successfully',
    cafeNameUpdated: 'Restaurant name updated',
    sectionSaved: 'Section saved successfully',
    sectionDeleted: 'Section deleted',
    dishSaved: 'Dish saved successfully',
    dishDeleted: 'Dish deleted',
    genericError: 'Something went wrong, please try again',
    addNewSection: 'Add New Section',
    deleteConfirmTitle: 'Confirm Deletion',
    deleteConfirmOk: 'Delete',
    cannotUndo: 'This action cannot be undone.',
    removeImage: 'Remove Image',
    editTooltip: 'Edit',
    deleteTooltip: 'Delete',
    dragToReorder: 'Drag to reorder',
    currency: 'MAD',
    dishCountLabel: 'Dish count',
    sectionNameRequiredError: 'Please enter the section name in Arabic.',
    dishNameRequiredError: 'Please enter the dish name in Arabic.',
    priceInvalidError: 'Please enter a valid price.',
    selectSectionError: 'Please select a section.',
  }
};

const DEFAULT_THEME = 'mocha-mousse';

// حد أقصى لحجم الصورة: 2 ميجابايت
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// إغلاق النوافذ بمفتاح Escape + حبس التركيز (Focus Trap) داخل النافذة المفتوحة
function useModalFocus(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && ref.current) {
        const focusables = ref.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      prev?.focus();
    };
  }, [open]);

  return ref;
}

export default function DashboardPage() {
  const router = useRouter();
  const [uiLang, setUiLang] = useState<'ar' | 'fr' | 'en'>('ar');
  const t = translations[uiLang];

  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  const [cafes, setCafes] = useState<any[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCafeName, setNewCafeName] = useState('');

  const [showEditCafeModal, setShowEditCafeModal] = useState(false);
  const [updatedCafeName, setUpdatedCafeName] = useState('');
  const [savingCafeName, setSavingCafeName] = useState(false);

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionNameAr, setSectionNameAr] = useState('');
  const [sectionNameFr, setSectionNameFr] = useState('');
  const [sectionNameEn, setSectionNameEn] = useState('');
  const [sectionImageFile, setSectionImageFile] = useState<File | null>(null);
  const [sectionImagePreview, setSectionImagePreview] = useState<string>('');
  const [existingSectionImageUrl, setExistingSectionImageUrl] = useState('');
  const [uploadingSectionImage, setUploadingSectionImage] = useState(false);
  const [sectionFormError, setSectionFormError] = useState('');
  const [sectionErrors, setSectionErrors] = useState<{ nameAr?: string }>({});
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const sectionFormRef = useRef<HTMLFormElement>(null);
  const sectionSubmittingRef = useRef(false);

  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [dishNameAr, setDishNameAr] = useState('');
  const [dishNameFr, setDishNameFr] = useState('');
  const [dishNameEn, setDishNameEn] = useState('');

  const [dishDescAr, setDishDescAr] = useState('');
  const [dishDescFr, setDishDescFr] = useState('');
  const [dishDescEn, setDishDescEn] = useState('');

  const [dishPrice, setDishPrice] = useState('');
  const [dishIsAvailable, setDishIsAvailable] = useState(true);
  const [dishImageFile, setDishImageFile] = useState<File | null>(null);
  const [dishImagePreview, setDishImagePreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState('');
  const [dishErrors, setDishErrors] = useState<{ nameAr?: string; price?: string }>({});
  const [showDishForm, setShowDishForm] = useState(false);
  const [dishLangTab, setDishLangTab] = useState<'ar' | 'fr' | 'en'>('ar');
  const dishFormRef = useRef<HTMLFormElement>(null);
  const dishSubmittingRef = useRef(false);

  const [dishSearchQuery, setDishSearchQuery] = useState('');

  const [showQrModal, setShowQrModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // نافذة تأكيد الحذف المخصصة (بدل confirm() المتصفح)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'section' | 'dish'; id: string } | null>(null);

  // عدّادات الأطباق لكل قسم
  const [dishCounts, setDishCounts] = useState<Record<string, number>>({});

  // إغلاق النوافذ بمفتاح Escape + استعادة التركيز عند الإغلاق
  const deleteModalRef = useModalFocus(!!deleteTarget, () => setDeleteTarget(null));
  const cafeModalRef = useModalFocus(showEditCafeModal, () => setShowEditCafeModal(false));
  const qrModalRef = useModalFocus(showQrModal, () => setShowQrModal(false));

  useEffect(() => {
    setOrigin(window.location.origin);
    setChecking(false);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCafes();
    } else {
      checkAuth();
    }
  }, [userId]);

  async function checkAuth() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      router.replace('/login');
    } else {
      setUserId(user.id);
    }
  }

  // دالة تسجيل الخروج
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  useEffect(() => {
    if (selectedCafe) {
      fetchSections(selectedCafe.id);
      setUpdatedCafeName(selectedCafe.name);
    }
  }, [selectedCafe]);

  useEffect(() => {
    if (selectedSectionId) {
      fetchDishes(selectedSectionId);
      setDishSearchQuery('');
    }
  }, [selectedSectionId]);

  async function fetchCafes() {
    setLoading(true);
    const { data, error } = await supabase
      .from('cafes')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching cafes:', error.message);
      toast.error(t.genericError);
    } else {
      setCafes(data || []);
      if (data && data.length > 0) {
        setSelectedCafe(data[0]);
      }
    }
    setLoading(false);
  }

  async function handleCreateCafe(e: React.FormEvent) {
    e.preventDefault();
    if (!newCafeName.trim() || !userId) return;

    const baseSlug = newCafeName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]+/g, '')
      .slice(0, 60) || 'cafe';

    const { data: existing } = await supabase
      .from('cafes')
      .select('slug')
      .eq('slug', baseSlug)
      .maybeSingle();

    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const { data, error } = await supabase
      .from('cafes')
      .insert([{ name: newCafeName, slug, owner_id: userId, theme: DEFAULT_THEME }])
      .select();

    if (error) {
      toast.error('Error: ' + error.message);
    } else if (data) {
      setCafes([...cafes, data[0]]);
      setSelectedCafe(data[0]);
      setNewCafeName('');
      toast.success(t.cafeCreated);
    }
  }

  async function handleUpdateCafeName(e: React.FormEvent) {
    e.preventDefault();
    if (!updatedCafeName.trim() || !selectedCafe || savingCafeName) return;

    setSavingCafeName(true);

    const baseSlug = updatedCafeName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]+/g, '')
      .slice(0, 60) || 'cafe';

    const { data: existing } = await supabase
      .from('cafes')
      .select('slug')
      .eq('slug', baseSlug)
      .neq('id', selectedCafe.id)
      .maybeSingle();

    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const { data, error } = await supabase
      .from('cafes')
      .update({ name: updatedCafeName.trim(), slug: slug })
      .eq('id', selectedCafe.id)
      .select();

    if (error) {
      toast.error('Error: ' + error.message);
    } else if (data && data.length > 0) {
      const updated = data[0];
      setSelectedCafe(updated);
      setCafes(cafes.map(c => c.id === updated.id ? updated : c));
      setShowEditCafeModal(false);
      toast.success(t.cafeNameUpdated);
    }
    setSavingCafeName(false);
  }

  async function fetchSections(cafeId: string) {
    const { data, error } = await supabase
      .from('menu_sections')
      .select('*')
      .eq('cafe_id', cafeId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching sections:', error.message);
      toast.error(t.genericError);
    } else {
      setSections(data || []);
      if (data && data.length > 0) {
        if (!selectedSectionId || !data.some(s => s.id === selectedSectionId)) {
          setSelectedSectionId(data[0].id);
        }
        fetchDishCounts(data.map((s) => s.id));
      } else {
        setSelectedSectionId('');
        setDishes([]);
        setDishCounts({});
      }
    }
  }

  // جلب عدد الأطباق في كل قسم دفعة واحدة (استعلام واحد)
  async function fetchDishCounts(sectionIds: string[]) {
    if (sectionIds.length === 0) {
      setDishCounts({});
      return;
    }
    const { data, error } = await supabase
      .from('dishes')
      .select('section_id')
      .in('section_id', sectionIds);

    if (error) {
      console.error('Error fetching dish counts:', error.message);
      return;
    }
    const counts: Record<string, number> = {};
    (data || []).forEach((d) => {
      counts[d.section_id] = (counts[d.section_id] || 0) + 1;
    });
    setDishCounts(counts);
  }

  // التحقق من صحة الملف (الحجم والنوع) قبل قبوله
  function validateImageFile(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return t.invalidFileType;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return t.fileTooLarge;
    }
    return null;
  }

  function handleSectionImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setSectionFormError(validationError);
      toast.error(validationError);
      e.target.value = '';
      return;
    }

    setSectionFormError('');
    setSectionImageFile(file);
    setSectionImagePreview(URL.createObjectURL(file));
  }

  function removeSectionImage() {
    setSectionImageFile(null);
    setSectionImagePreview('');
    setExistingSectionImageUrl('');
  }

  async function uploadSectionImageToStorage(): Promise<string | null> {
    if (!sectionImageFile) return existingSectionImageUrl || null;

    setUploadingSectionImage(true);
    setSectionFormError('');

    try {
      const fileExt = sectionImageFile.name.split('.').pop();
      const fileName = `sections/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('dish-images').upload(fileName, sectionImageFile);

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('dish-images').getPublicUrl(fileName);

      setUploadingSectionImage(false);
      return data.publicUrl;
    } catch (err: any) {
      setUploadingSectionImage(false);
      setSectionFormError('Upload failed: ' + err.message);
      toast.error('Upload failed: ' + err.message);
      return null;
    }
  }

  function resetSectionForm() {
    setEditingSectionId(null);
    setSectionNameAr('');
    setSectionNameFr('');
    setSectionNameEn('');
    setSectionImageFile(null);
    setSectionImagePreview('');
    setExistingSectionImageUrl('');
    setSectionFormError('');
    setSectionErrors({});
  }

  // إغلاق نموذج القسم (إلغاء أو إنهاء التعديل)
  function closeSectionForm() {
    resetSectionForm();
    setShowSectionForm(false);
  }

  function handleEditSectionClick(sec: any) {
    setEditingSectionId(sec.id);
    setShowSectionForm(true);
    setSectionNameAr(sec.name_ar || sec.name || '');
    setSectionNameFr(sec.name_fr || '');
    setSectionNameEn(sec.name_en || '');
    setExistingSectionImageUrl(sec.image_url || '');
    setSectionImagePreview(sec.image_url || '');
    setSectionImageFile(null);
    setSectionFormError('');
    setSectionErrors({});
    // تمرير الشاشة تلقائياً نحو النموذج ليعرف المستخدم أن التعديل بدأ
    sectionFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSaveSection(e: React.FormEvent) {
    e.preventDefault();
    setSectionFormError('');
    setSectionErrors({});

    // منع الإرسال المتكرر (double submit)
    if (sectionSubmittingRef.current) return;

    if (!sectionNameAr.trim() || !selectedCafe) {
      setSectionErrors({ nameAr: t.sectionNameRequiredError });
      sectionFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    sectionSubmittingRef.current = true;

    let finalImageUrl = existingSectionImageUrl;
    if (sectionImageFile) {
      const uploadedUrl = await uploadSectionImageToStorage();
      if (!uploadedUrl) {
        sectionSubmittingRef.current = false;
        return;
      }
      finalImageUrl = uploadedUrl;
    }

    const sectionPayload = {
      name: sectionNameAr,
      name_ar: sectionNameAr,
      name_fr: sectionNameFr || null,
      name_en: sectionNameEn || null,
      image_url: finalImageUrl,
    };

    if (editingSectionId) {
      const { data, error } = await supabase
        .from('menu_sections')
        .update(sectionPayload)
        .eq('id', editingSectionId)
        .select();

      if (error) {
        setSectionFormError('Error: ' + error.message);
        toast.error('Error: ' + error.message);
      } else if (data) {
        setSections(sections.map((s) => (s.id === editingSectionId ? data[0] : s)));
        resetSectionForm();
        setShowSectionForm(false);
        toast.success(t.sectionSaved);
      }
    } else {
      const nextOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.display_order || 0)) + 1 : 0;
      const { data, error } = await supabase
        .from('menu_sections')
        .insert([{ cafe_id: selectedCafe.id, display_order: nextOrder, ...sectionPayload }])
        .select();

      if (error) {
        setSectionFormError('Error: ' + error.message);
        toast.error('Error: ' + error.message);
      } else if (data) {
        setSections([...sections, data[0]]);
        setDishCounts((c) => ({ ...c, [data[0].id]: 0 }));
        // إبقاء النموذج مفتوحاً لتسهيل إضافة عدة أقسام متتالية
        resetSectionForm();
        setShowSectionForm(true);
        toast.success(t.sectionSaved);
        if (sections.length === 0) {
          setSelectedSectionId(data[0].id);
        }
      }
    }

    sectionSubmittingRef.current = false;
  }

  // يُستدعى من نافذة التأكيد المخصصة بعد موافقة المستخدم
  async function handleDeleteSection(secId: string) {
    const { error } = await supabase.from('menu_sections').delete().eq('id', secId);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      const remainingSections = sections.filter((s) => s.id !== secId);
      setSections(remainingSections);
      setDishCounts((c) => {
        const next = { ...c };
        delete next[secId];
        return next;
      });
      if (editingSectionId === secId) closeSectionForm();
      if (selectedSectionId === secId) {
        if (remainingSections.length > 0) {
          setSelectedSectionId(remainingSections[0].id);
        } else {
          setSelectedSectionId('');
          setDishes([]);
        }
      }
      toast.success(t.sectionDeleted);
    }
  }

  async function handleDragEndSections(result: any) {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);

    const updates = items.map((sec, idx) =>
      supabase.from('menu_sections').update({ display_order: idx }).eq('id', sec.id)
    );
    await Promise.all(updates);
  }

  async function fetchDishes(sectionId: string) {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('section_id', sectionId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching dishes:', error.message);
      toast.error(t.genericError);
    } else {
      setDishes(data || []);
    }
  }

  async function handleDragEndDishes(result: any) {
    if (!result.destination) return;

    const items = Array.from(dishes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDishes(items);

    const updates = items.map((dish, idx) =>
      supabase.from('dishes').update({ display_order: idx }).eq('id', dish.id)
    );
    await Promise.all(updates);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
      e.target.value = '';
      return;
    }

    setFormError('');
    setDishImageFile(file);
    setDishImagePreview(URL.createObjectURL(file));
  }

  function removeDishImage() {
    setDishImageFile(null);
    setDishImagePreview('');
    setExistingImageUrl('');
  }

  async function uploadImageToStorage(): Promise<string | null> {
    if (!dishImageFile) return existingImageUrl || null;

    setUploadingImage(true);
    setFormError('');

    try {
      const fileExt = dishImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('dish-images').upload(fileName, dishImageFile);

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('dish-images').getPublicUrl(fileName);

      setUploadingImage(false);
      return data.publicUrl;
    } catch (err: any) {
      setUploadingImage(false);
      setFormError('Upload failed: ' + err.message);
      toast.error('Upload failed: ' + err.message);
      return null;
    }
  }

  function resetDishForm() {
    setEditingDishId(null);
    setDishNameAr('');
    setDishNameFr('');
    setDishNameEn('');
    setDishDescAr('');
    setDishDescFr('');
    setDishDescEn('');
    setDishPrice('');
    setDishIsAvailable(true);
    setDishImageFile(null);
    setDishImagePreview('');
    setExistingImageUrl('');
    setFormError('');
    setDishErrors({});
    setDishLangTab('ar');
  }

  // إغلاق نموذج الطبق (إلغاء أو إنهاء التعديل)
  function closeDishForm() {
    resetDishForm();
    setShowDishForm(false);
  }

  function handleEditDishClick(dish: any) {
    setEditingDishId(dish.id);
    setShowDishForm(true);
    setDishNameAr(dish.name_ar || dish.name || '');
    setDishNameFr(dish.name_fr || '');
    setDishNameEn(dish.name_en || '');
    setDishDescAr(dish.description_ar || dish.description || '');
    setDishDescFr(dish.description_fr || '');
    setDishDescEn(dish.description_en || '');
    setDishPrice(dish.price ? dish.price.toString() : '');
    setDishIsAvailable(dish.is_available ?? true);
    setExistingImageUrl(dish.image_url || '');
    setDishImagePreview(dish.image_url || '');
    setDishImageFile(null);
    setFormError('');
    setDishErrors({});
    // فتح التبويب المناسب حسب اللغة المتوفرة للطبق
    setDishLangTab(dish.name_ar || dish.name ? 'ar' : dish.name_fr ? 'fr' : 'en');
    // تمرير الشاشة تلقائياً نحو نموذج تعديل الطبق
    dishFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // يُستدعى من نافذة التأكيد المخصصة بعد موافقة المستخدم
  async function handleDeleteDish(dishId: string) {
    const { error } = await supabase.from('dishes').delete().eq('id', dishId);

    if (error) {
      toast.error('Error: ' + error.message);
    } else {
      setDishes(dishes.filter((d) => d.id !== dishId));
      setDishCounts((c) => ({
        ...c,
        [selectedSectionId]: Math.max(0, (c[selectedSectionId] || 0) - 1),
      }));
      if (editingDishId === dishId) resetDishForm();
      toast.success(t.dishDeleted);
    }
  }

  // تنفيذ الحذف المؤكد من نافذة التأكيد
  async function confirmDelete() {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setDeleteTarget(null);
    if (type === 'section') {
      await handleDeleteSection(id);
    } else {
      await handleDeleteDish(id);
    }
  }

  async function handleSaveDish(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setDishErrors({});

    // منع الإرسال المتكرر (double submit)
    if (dishSubmittingRef.current) return;

    if (!dishNameAr.trim()) {
      setDishErrors({ nameAr: t.dishNameRequiredError });
      setDishLangTab('ar');
      dishFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const priceNum = parseFloat(dishPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setDishErrors({ price: t.priceInvalidError });
      dishFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (!selectedSectionId) {
      setFormError(t.selectSectionError);
      return;
    }

    dishSubmittingRef.current = true;

    let finalImageUrl = existingImageUrl;
    if (dishImageFile) {
      const uploadedUrl = await uploadImageToStorage();
      if (!uploadedUrl) {
        dishSubmittingRef.current = false;
        return;
      }
      finalImageUrl = uploadedUrl;
    }

    const dishPayload = {
      name: dishNameAr,
      name_ar: dishNameAr,
      name_fr: dishNameFr,
      name_en: dishNameEn,
      description: dishDescAr,
      description_ar: dishDescAr,
      description_fr: dishDescFr,
      description_en: dishDescEn,
      price: priceNum,
      is_available: dishIsAvailable,
      image_url: finalImageUrl,
    };

    if (editingDishId) {
      const { data, error } = await supabase.from('dishes').update(dishPayload).eq('id', editingDishId).select();

      if (error) {
        setFormError('Error: ' + error.message);
        toast.error('Error: ' + error.message);
      } else if (data) {
        setDishes(dishes.map((d) => (d.id === editingDishId ? data[0] : d)));
        resetDishForm();
        setShowDishForm(false);
        toast.success(t.dishSaved);
      }
    } else {
      const nextOrder = dishes.length > 0 ? Math.max(...dishes.map((d) => d.display_order || 0)) + 1 : 0;
      const { data, error } = await supabase
        .from('dishes')
        .insert([{ section_id: selectedSectionId, display_order: nextOrder, ...dishPayload }])
        .select();

      if (error) {
        setFormError('Error: ' + error.message);
        toast.error('Error: ' + error.message);
      } else if (data) {
        setDishes([...dishes, data[0]]);
        setDishCounts((c) => ({ ...c, [selectedSectionId]: (c[selectedSectionId] || 0) + 1 }));
        // إبقاء النموذج مفتوحاً لتسهيل إضافة عدة أطباق متتالية
        resetDishForm();
        setShowDishForm(true);
        toast.success(t.dishSaved);
      }
    }

    dishSubmittingRef.current = false;
  }

  // نسخ رابط القائمة إلى الحافظة
  async function handleCopyLink(menuUrl: string) {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setLinkCopied(true);
      toast.success(t.linkCopied);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error(t.genericError);
    }
  }

  // تصفية الأطباق حسب نص البحث (يعمل على جميع اللغات المتوفرة للاسم)
  const filteredDishes = useMemo(() => {
    if (!dishSearchQuery.trim()) return dishes;
    const q = dishSearchQuery.trim().toLowerCase();
    return dishes.filter((dish) => {
      const names = [dish.name_ar, dish.name_fr, dish.name_en, dish.name].filter(Boolean);
      return names.some((n: string) => n.toLowerCase().includes(q));
    });
  }, [dishes, dishSearchQuery]);

  const isSectionBusy = uploadingSectionImage;
  const isDishBusy = uploadingImage;

  if (checking || loading) {
    return <div className="p-8 text-center">{t.loading}</div>;
  }

  const menuUrl = selectedCafe && origin ? `${origin}/menu/${selectedCafe.slug}` : '';

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm gap-4">
  <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
    <Utensils className="text-blue-600" /> {t.dashboardTitle}
  </h1>

  <div className="flex items-center gap-4 flex-wrap justify-center">
    {selectedCafe && (
      <div className="flex items-center gap-3 border-x px-4">
        {/* 1. اسم المطعم الحالي */}
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium">
          <span>{t.currentCafe} {selectedCafe.name}</span>
          <button 
            onClick={() => {
              setUpdatedCafeName(selectedCafe.name);
              setShowEditCafeModal(true);
            }}
            className="p-1 hover:bg-blue-100 rounded-full transition text-blue-600"
            title={t.editCafeNameTitle}
            aria-label={t.editCafeNameTitle}
          >
            <Edit2 size={14} />
          </button>
        </div>

        {/* 2. QR Code القائمة */}
        <button
          onClick={() => setShowQrModal(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-blue-700 transition"
        >
          <QrCode size={18} /> {t.qrCode}
        </button>
      </div>
    )}
  {/* 4. أزرار الترجمة */}
    <div className="flex bg-slate-100 rounded-lg p-1">
      <button onClick={() => setUiLang('ar')} className={`px-3 py-1 text-sm rounded-md transition ${uiLang === 'ar' ? 'bg-white shadow-sm font-bold text-blue-600' : 'text-slate-500'}`}>عربي</button>
      <button onClick={() => setUiLang('fr')} className={`px-3 py-1 text-sm rounded-md transition ${uiLang === 'fr' ? 'bg-white shadow-sm font-bold text-blue-600' : 'text-slate-500'}`}>FR</button>
      <button onClick={() => setUiLang('en')} className={`px-3 py-1 text-sm rounded-md transition ${uiLang === 'en' ? 'bg-white shadow-sm font-bold text-blue-600' : 'text-slate-500'}`}>EN</button>
    </div>
    {/* 3. زر تسجيل الخروج */}
    <button
      onClick={handleLogout}
      className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-red-100 transition font-medium"
      title={t.logout}
      aria-label={t.logout}
    >
      <LogOut size={16} /> {t.logout}
    </button>

  
  </div>
</header>

        {/* Modal تعديل اسم المطعم */}
        {showEditCafeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 outline-none" ref={cafeModalRef} tabIndex={-1}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative shadow-xl">
              <button onClick={() => setShowEditCafeModal(false)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600" aria-label={t.cancel}>
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold text-slate-800 mb-4">{t.editCafeNameTitle}</h3>
              
              <form onSubmit={handleUpdateCafeName} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{t.cafeNameLabel}</label>
                  <input
                    type="text"
                    value={updatedCafeName}
                    onChange={(e) => setUpdatedCafeName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={savingCafeName}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingCafeName}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {savingCafeName ? t.uploading : t.saveCafeName}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditCafeModal(false)}
                    disabled={savingCafeName}
                    className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition disabled:opacity-60"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal QR Code */}
        {showQrModal && selectedCafe && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 outline-none" ref={qrModalRef} tabIndex={-1}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative shadow-xl">
              <button onClick={() => setShowQrModal(false)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600" aria-label={t.cancel}>
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{t.scanQrTitle}</h3>
              <p className="text-xs text-slate-500 mb-4">{t.scanQrDesc} {selectedCafe.name}</p>

              <div className="bg-white p-4 border rounded-xl inline-block shadow-inner mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <p className="flex-1 text-xs text-blue-600 break-all bg-blue-50 p-2 rounded text-start">
                  {menuUrl}
                </p>
                <button
                  onClick={() => handleCopyLink(menuUrl)}
                  className="shrink-0 p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                  title={t.copyLink}
                  aria-label={t.copyLink}
                >
                  {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <button
                onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(menuUrl)}`, '_blank')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                {t.downloadHighQuality}
              </button>
            </div>
          </div>
        )}

        {/* Modal تأكيد الحذف المخصص */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 outline-none" role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-title" ref={deleteModalRef} tabIndex={-1}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative shadow-xl">
              <h3 id="delete-confirm-title" className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Trash2 size={18} className="text-red-500" /> {t.deleteConfirmTitle}
              </h3>
              <p className="text-sm text-slate-600 mb-1">
                {deleteTarget.type === 'section' ? t.deleteSectionConfirm : t.deleteDishConfirm}
              </p>
              <p className="text-xs text-red-500 mb-4">{t.cannotUndo}</p>
              <div className="flex gap-2">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                >
                  {t.deleteConfirmOk}
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {cafes.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm max-w-md mx-auto text-center">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">{t.createCafePrompt}</h2>
            <form onSubmit={handleCreateCafe} className="flex gap-2">
              <input
                type="text"
                placeholder={t.cafeNamePlaceholder}
                value={newCafeName}
                onChange={(e) => setNewCafeName(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm">
                {t.createBtn}
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* قسم إدارة الأقسام */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                  <FolderPlus size={20} className="text-blue-600" /> {t.menuSections}
                </h2>
                {(editingSectionId || showSectionForm) && (
                  <button type="button" onClick={closeSectionForm} className="text-xs text-red-600 flex items-center gap-1 hover:underline">
                    <X size={14} /> {t.cancel}
                  </button>
                )}
              </div>

              {/* زر إضافة قسم جديد (النموذج مطوي افتراضياً) */}
              {!showSectionForm && !editingSectionId && (
                <button
                  type="button"
                  onClick={() => setShowSectionForm(true)}
                  className="w-full mb-4 border-2 border-dashed border-blue-200 text-blue-600 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 transition flex items-center justify-center gap-1"
                >
                  <Plus size={16} /> {t.addNewSection}
                </button>
              )}

              {(showSectionForm || editingSectionId) && (
              <form ref={sectionFormRef} onSubmit={handleSaveSection} className="mb-4 space-y-2 bg-slate-50 p-3 rounded-xl">
                {sectionFormError && <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs">{sectionFormError}</div>}
                <fieldset disabled={isSectionBusy} className="space-y-2 disabled:opacity-60">
                  <div>
                    <input
                      type="text"
                      placeholder={t.sectionNameArPlaceholder}
                      value={sectionNameAr}
                      onChange={(e) => { setSectionNameAr(e.target.value); setSectionErrors((s) => ({ ...s, nameAr: undefined })); }}
                      dir="rtl"
                      aria-invalid={!!sectionErrors.nameAr}
                      className={`w-full border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 bg-white ${sectionErrors.nameAr ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-blue-500'}`}
                    />
                    {sectionErrors.nameAr && <p className="text-xs text-red-600 mt-1 px-1">{sectionErrors.nameAr}</p>}
                  </div>
                  <input
                    type="text"
                    placeholder={t.sectionNameFrPlaceholder}
                    value={sectionNameFr}
                    onChange={(e) => setSectionNameFr(e.target.value)}
                    dir="ltr"
                    className="w-full border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white border-slate-200"
                  />
                  <input
                    type="text"
                    placeholder={t.sectionNameEnPlaceholder}
                    value={sectionNameEn}
                    onChange={(e) => setSectionNameEn(e.target.value)}
                    dir="ltr"
                    className="w-full border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white border-slate-200"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {sectionImagePreview ? (
                        <div className="relative">
                          <img src={sectionImagePreview} alt={t.dishImage} className="w-12 h-12 object-cover rounded-lg border" />
                          <button
                            type="button"
                            onClick={removeSectionImage}
                            title={t.removeImage}
                            aria-label={t.removeImage}
                            className="absolute -top-1.5 -end-1.5 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : null}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleSectionImageChange}
                        className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
                      />
                    </div>
                  </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={isSectionBusy}
                  className="w-full bg-blue-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploadingSectionImage ? t.uploading : editingSectionId ? t.save : t.add}
                </button>
              </form>
              )}

              <DragDropContext onDragEnd={handleDragEndSections}>
                <Droppable droppableId="sections-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 max-h-[400px] overflow-y-auto">
                      {sections.map((sec, index) => {
                        const displaySectionName = 
                          uiLang === 'ar' ? (sec.name_ar || sec.name) :
                          uiLang === 'fr' ? (sec.name_fr || sec.name_ar || sec.name) :
                          (sec.name_en || sec.name_ar || sec.name);

                        return (
                          <Draggable key={sec.id} draggableId={sec.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                onClick={() => setSelectedSectionId(sec.id)}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                                  selectedSectionId === sec.id
                                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                    : 'border-slate-100 hover:bg-slate-50 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing" title={t.dragToReorder}>
                                    <GripVertical size={16} />
                                  </div>
                                  {sec.image_url && (
                                    <img src={sec.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                  )}
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-800">{displaySectionName}</h4>
                                  </div>
                                  <span
                                    title={t.dishCountLabel}
                                    className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full"
                                  >
                                    {dishCounts[sec.id] || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSectionClick(sec);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition"
                                    title={t.editTooltip}
                                    aria-label={t.editTooltip}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteTarget({ type: 'section', id: sec.id });
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                                    title={t.deleteTooltip}
                                    aria-label={t.deleteTooltip}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* قسم إدارة الأطباق والمنتجات */}
            <div className="bg-white p-5 rounded-xl shadow-sm md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                  <Utensils size={20} className="text-blue-600" /> {t.dishesAndProducts}
                </h2>
                {(editingDishId || showDishForm) && (
                  <button type="button" onClick={closeDishForm} className="text-xs text-red-600 flex items-center gap-1 hover:underline">
                    <X size={14} /> {t.cancelEdit}
                  </button>
                )}
              </div>

              {!selectedSectionId ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  {t.selectSectionMsg}
                </div>
              ) : (
                <>
                  {/* زر إضافة طبق جديد (النموذج مطوي افتراضياً) */}
                  {!showDishForm && !editingDishId && (
                    <button
                      type="button"
                      onClick={() => setShowDishForm(true)}
                      className="w-full mb-6 border-2 border-dashed border-blue-200 text-blue-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 transition flex items-center justify-center gap-1"
                    >
                      <Plus size={16} /> {t.addNewDish}
                    </button>
                  )}

                  {(showDishForm || editingDishId) && (
                  <form ref={dishFormRef} onSubmit={handleSaveDish} className="mb-6 bg-slate-50 p-4 rounded-xl space-y-3">
                    <h3 className="text-sm font-bold text-slate-700">
                      {editingDishId ? t.editDishTitle : t.addNewDish}
                    </h3>
                    {formError && <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs">{formError}</div>}

                    <fieldset disabled={isDishBusy} className="space-y-3 disabled:opacity-60">
                      {/* تبويبات اللغة (عربي / فرنسي / إنجليزي) */}
                      <div className="flex bg-slate-100 rounded-lg p-1 w-fit" role="tablist" aria-label={t.dishNameAr}>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={dishLangTab === 'ar'}
                          onClick={() => setDishLangTab('ar')}
                          className={`px-3 py-1 text-xs rounded-md transition ${dishLangTab === 'ar' ? 'bg-white shadow-sm font-bold text-blue-600' : 'text-slate-500'}`}
                        >
                          عربي
                          {(dishNameAr || dishDescAr) && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block ms-1 align-middle" />}
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={dishLangTab === 'fr'}
                          onClick={() => setDishLangTab('fr')}
                          className={`px-3 py-1 text-xs rounded-md transition ${dishLangTab === 'fr' ? 'bg-white shadow-sm font-bold text-blue-600' : 'text-slate-500'}`}
                        >
                          FR
                          {(dishNameFr || dishDescFr) && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block ms-1 align-middle" />}
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={dishLangTab === 'en'}
                          onClick={() => setDishLangTab('en')}
                          className={`px-3 py-1 text-xs rounded-md transition ${dishLangTab === 'en' ? 'bg-white shadow-sm font-bold text-blue-600' : 'text-slate-500'}`}
                        >
                          EN
                          {(dishNameEn || dishDescEn) && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block ms-1 align-middle" />}
                        </button>
                      </div>

                      {dishLangTab === 'ar' && (
                        <div className="space-y-2">
                          <div>
                            <input
                              type="text"
                              placeholder={t.dishNameAr}
                              value={dishNameAr}
                              onChange={(e) => { setDishNameAr(e.target.value); setDishErrors((s) => ({ ...s, nameAr: undefined })); }}
                              dir="rtl"
                              aria-invalid={!!dishErrors.nameAr}
                              className={`w-full border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 bg-white ${dishErrors.nameAr ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-blue-500'}`}
                            />
                            {dishErrors.nameAr && <p className="text-xs text-red-600 mt-1 px-1">{dishErrors.nameAr}</p>}
                          </div>
                          <textarea
                            placeholder={t.descAr}
                            value={dishDescAr}
                            onChange={(e) => setDishDescAr(e.target.value)}
                            dir="rtl"
                            rows={2}
                            className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white border-slate-200 resize-none"
                          />
                        </div>
                      )}

                      {dishLangTab === 'fr' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder={t.dishNameFr}
                            value={dishNameFr}
                            onChange={(e) => setDishNameFr(e.target.value)}
                            dir="ltr"
                            className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white border-slate-200"
                          />
                          <textarea
                            placeholder={t.descFr}
                            value={dishDescFr}
                            onChange={(e) => setDishDescFr(e.target.value)}
                            dir="ltr"
                            rows={2}
                            className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white border-slate-200 resize-none"
                          />
                        </div>
                      )}

                      {dishLangTab === 'en' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder={t.dishNameEn}
                            value={dishNameEn}
                            onChange={(e) => setDishNameEn(e.target.value)}
                            dir="ltr"
                            className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white border-slate-200"
                          />
                          <textarea
                            placeholder={t.descEn}
                            value={dishDescEn}
                            onChange={(e) => setDishDescEn(e.target.value)}
                            dir="ltr"
                            rows={2}
                            className="w-full border rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white border-slate-200 resize-none"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={t.price}
                            value={dishPrice}
                            onChange={(e) => { setDishPrice(e.target.value); setDishErrors((s) => ({ ...s, price: undefined })); }}
                            aria-invalid={!!dishErrors.price}
                            className={`w-full border rounded-lg px-3 py-2 pe-10 text-xs outline-none focus:ring-2 bg-white ${dishErrors.price ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-blue-500'}`}
                          />
                          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                            {t.currency}
                          </span>
                          {dishErrors.price && <p className="text-xs text-red-600 mt-1 px-1">{dishErrors.price}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">{t.available}</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={dishIsAvailable}
                            aria-label={t.available}
                            onClick={() => setDishIsAvailable(!dishIsAvailable)}
                            className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${dishIsAvailable ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow" />
                          </button>
                          <span className={`text-xs font-medium ${dishIsAvailable ? 'text-blue-600' : 'text-slate-400'}`}>
                            {dishIsAvailable ? t.yes : t.no}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {dishImagePreview ? (
                            <div className="relative shrink-0">
                              <img src={dishImagePreview} alt={t.dishImage} className="w-12 h-12 rounded-lg object-cover border" />
                              <button
                                type="button"
                                onClick={removeDishImage}
                                title={t.removeImage}
                                aria-label={t.removeImage}
                                className="absolute -top-1.5 -end-1.5 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ) : null}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleImageChange}
                            className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
                          />
                        </div>
                      </div>
                    </fieldset>

                    <button
                      type="submit"
                      disabled={isDishBusy}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {uploadingImage ? t.uploading : editingDishId ? t.saveDishBtn : t.addDishBtn}
                    </button>
                  </form>
                  )}

                  {/* حقل البحث عن طبق */}
                  {dishes.length > 0 && (
                    <div className="relative mb-3">
                      <Search size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t.searchDishes}
                        value={dishSearchQuery}
                        onChange={(e) => setDishSearchQuery(e.target.value)}
                        className="w-full border rounded-lg ps-8 pe-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white border-slate-200"
                      />
                    </div>
                  )}

                  {/* قائمة الأطباق داخل القسم */}
                  <DragDropContext onDragEnd={handleDragEndDishes}>
                    <Droppable droppableId="dishes-list">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 max-h-[400px] overflow-y-auto">
                          {dishes.length === 0 ? (
                            <div className="text-center py-10">
                              <p className="text-slate-400 text-xs mb-3">{t.noDishes}</p>
                              <button
                                type="button"
                                onClick={() => setShowDishForm(true)}
                                className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100 transition"
                              >
                                {t.addNewDish}
                              </button>
                            </div>
                          ) : filteredDishes.length === 0 ? (
                            <p className="text-center text-slate-400 text-xs py-8">{t.noDishesMatch}</p>
                          ) : (
                            filteredDishes.map((dish, index) => {
                              const displayDishName = 
                                uiLang === 'ar' ? (dish.name_ar || dish.name) :
                                uiLang === 'fr' ? (dish.name_fr || dish.name_ar || dish.name) :
                                (dish.name_en || dish.name_ar || dish.name);

                              return (
                                <Draggable key={dish.id} draggableId={dish.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:bg-slate-50 transition shadow-sm"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing" title={t.dragToReorder}>
                                          <GripVertical size={16} />
                                        </div>
                                        {dish.image_url ? (
                                          <img src={dish.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                        ) : (
                                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-[10px]">
                                            {t.noImage}
                                          </div>
                                        )}
                                        <div>
                                          <h4 className="text-sm font-bold text-slate-800">{displayDishName}</h4>
                                          <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="font-semibold text-blue-600">{dish.price} {t.currency}</span>
                                            {!dish.is_available && (
                                              <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px]">
                                                {t.unavailable}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleEditDishClick(dish)}
                                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition"
                                          title={t.editTooltip}
                                          aria-label={t.editTooltip}
                                        >
                                          <Edit2 size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeleteTarget({ type: 'dish', id: dish.id })}
                                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                                          title={t.deleteTooltip}
                                          aria-label={t.deleteTooltip}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
