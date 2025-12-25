// ============================================
// RAM Dosya Atama - Tip Tanımları
// ============================================

/**
 * Öğretmen bilgileri
 */
export interface Teacher {
  id: string;
  name: string;
  isAbsent: boolean;
  absentDay?: string; // Devamsızlık tarihi (YYYY-MM-DD)
  yearlyLoad: number;
  monthly?: Record<string, number>;
  active: boolean;
  pushoverKey?: string;
  isTester: boolean;
  backupDay?: string;
}

/**
 * Duyuru
 */
export interface Announcement {
  id: string;
  text: string;
  createdAt: string;
}

/**
 * PDF'den okunan randevu bilgisi
 */
export interface PdfAppointment {
  id: string;
  time: string;
  name: string;
  fileNo: string;
  extra?: string;
}

/**
 * Dosya/Vaka bilgisi
 */
export interface CaseFile {
  id: string;
  student: string;
  fileNo?: string;
  score: number;
  createdAt: string; // ISO
  assignedTo?: string; // teacher.id
  type: "YONLENDIRME" | "DESTEK" | "IKISI";
  isNew: boolean;
  diagCount: number;
  isTest: boolean;
  assignReason?: string;
  absencePenalty?: boolean;
  backupBonus?: boolean;
  sourcePdfEntry?: PdfAppointment;
}

/**
 * Dosya türü
 */
export type CaseType = "YONLENDIRME" | "DESTEK" | "IKISI";

/**
 * E-Arşiv kaydı
 */
export interface EArchiveEntry {
  id: string;
  student: string;
  fileNo?: string;
  assignedToName: string;
  createdAt: string;
}

/**
 * Uygulama ayarları
 */
export interface Settings {
  dailyLimit: number;
  scoreTest: number;
  scoreNewBonus: number;
  scoreTypeY: number;
  scoreTypeD: number;
  scoreTypeI: number;
  backupBonusAmount: number;
  absencePenaltyAmount: number;
}

/**
 * Devamsızlık kaydı
 */
export interface AbsenceRecord {
  teacherId: string;
  date: string;
}

/**
 * Toast bildirimi
 */
export interface Toast {
  id: string;
  text: string;
}

/**
 * Atama popup bilgisi
 */
export interface AssignmentPopup {
  teacherName: string;
  studentName: string;
  score: number;
}

/**
 * Canlı bağlantı durumu
 */
export type LiveStatus = "connecting" | "online" | "offline";

/**
 * Tema modu
 */
export type ThemeMode = "light" | "dark" | "auto";

/**
 * Renk şeması
 */
export interface ColorScheme {
  name: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  bgBase: string;
  bgWarm: string;
  bgCard: string;
  textMain: string;
  textMuted: string;
  textLight: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}
