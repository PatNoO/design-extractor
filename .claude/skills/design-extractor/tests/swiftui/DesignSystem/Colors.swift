import SwiftUI

extension Color {
    static let primary      = Color(hex: "#2563EB")
    static let primaryHover = Color(hex: "#1D4ED8")
    static let background   = Color(hex: "#FFFFFF")
    static let surface      = Color(hex: "#F8FAFC")
    static let textPrimary  = Color(hex: "#0F172A")
    static let textSecondary = Color(hex: "#64748B")
    static let border       = Color(hex: "#E2E8F0")
    static let error        = Color(hex: "#DC2626")
    static let success      = Color(hex: "#16A34A")
    static let warning      = Color(hex: "#D97706")

    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8) & 0xFF) / 255
        let b = Double(int & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
