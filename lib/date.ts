// ============================================
// RAM Dosya Atama - Tarih Yardımcıları
// ============================================

/**
 * Bir aydaki gün sayısını döndürür
 * @param year - Yıl
 * @param month - Ay (1-12)
 */
export function daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

/**
 * ISO tarih stringinden YYYY-MM formatını çıkarır
 * @param dateIso - ISO tarih string
 */
export function ymOf(dateIso: string): string {
    return dateIso.slice(0, 7);
}

/**
 * Şu anki zamanı ISO formatında döndürür
 * Simülasyon modunda ?simDate parametresini kullanır
 */
export function nowISO(): string {
    if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const simDate = params.get("simDate");
        if (simDate && /^\d{4}-\d{2}-\d{2}$/.test(simDate)) {
            const now = new Date();
            return `${simDate}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.000Z`;
        }
    }
    return new Date().toISOString();
}

/**
 * Date nesnesinden YYYY-MM-DD formatı oluşturur
 * @param d - Date nesnesi
 */
export function ymdLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/**
 * Simülasyon tarihini veya gerçek tarihi döndürür
 * URL'de ?simDate=2025-12-06 parametresi varsa onu kullanır
 */
export function getSimulatedDate(): Date {
    if (typeof window === "undefined") return new Date();
    const params = new URLSearchParams(window.location.search);
    const simDate = params.get("simDate");
    if (simDate && /^\d{4}-\d{2}-\d{2}$/.test(simDate)) {
        return new Date(simDate + "T12:00:00");
    }
    return new Date();
}

/**
 * Bugünün tarihini YYYY-MM-DD formatında döndürür
 * Simülasyon modunu destekler
 */
export function getTodayYmd(): string {
    return ymdLocal(getSimulatedDate());
}

/**
 * Tarihi okunabilir Türkçe formata çevirir
 * @param dateIso - ISO tarih string
 */
export function formatDateTR(dateIso: string): string {
    const date = new Date(dateIso);
    return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

/**
 * Tarihi kısa formata çevirir (DD.MM.YYYY)
 * @param dateIso - ISO tarih string
 */
export function formatDateShort(dateIso: string): string {
    const date = new Date(dateIso);
    return date.toLocaleDateString("tr-TR");
}

/**
 * Saati HH:MM formatında döndürür
 * @param dateIso - ISO tarih string
 */
export function formatTime(dateIso: string): string {
    const date = new Date(dateIso);
    return date.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * İki tarih arasındaki gün farkını hesaplar
 * @param date1 - İlk tarih
 * @param date2 - İkinci tarih
 */
export function daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Tarihin bugün olup olmadığını kontrol eder
 * @param dateIso - ISO tarih string
 */
export function isToday(dateIso: string): boolean {
    return dateIso.slice(0, 10) === getTodayYmd();
}

/**
 * Haftanın gününü Türkçe döndürür
 * @param dateIso - ISO tarih string
 */
export function getDayNameTR(dateIso: string): string {
    const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const date = new Date(dateIso);
    return days[date.getDay()];
}
