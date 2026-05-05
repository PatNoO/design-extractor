import SwiftUI

struct CardView<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.s2) {
            Text(title)
                .font(.lg)
                .foregroundColor(.textPrimary)
            content
                .font(.sm)
                .foregroundColor(.textSecondary)
        }
        .padding(Spacing.s6)
        .background(Color.surface)
        .cornerRadius(Radius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: Radius.lg)
                .stroke(Color.border, lineWidth: 1)
        )
    }
}
