import SwiftUI

enum ButtonVariant { case primary, secondary, ghost }

struct AppButton: View {
    let label: String
    var variant: ButtonVariant = .primary
    var action: () -> Void = {}

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.sm)
                .fontWeight(.semibold)
                .padding(.vertical, Spacing.s2)
                .padding(.horizontal, Spacing.s4)
                .background(background)
                .foregroundColor(foreground)
                .cornerRadius(Radius.md)
                .overlay(
                    RoundedRectangle(cornerRadius: Radius.md)
                        .stroke(variant == .secondary ? Color.primary : .clear, lineWidth: 1)
                )
        }
    }

    private var background: Color {
        switch variant {
        case .primary:   return .primary
        case .secondary: return .clear
        case .ghost:     return .clear
        }
    }

    private var foreground: Color {
        switch variant {
        case .primary:   return .white
        case .secondary: return .primary
        case .ghost:     return .textSecondary
        }
    }
}
