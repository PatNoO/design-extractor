import SwiftUI

struct HomeView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: Spacing.s8) {
                    heroSection
                    componentsSection
                }
            }
            .background(Color.background)
            .navigationTitle("FixtureApp")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    AppButton(label: "Get Started")
                }
            }
        }
    }

    private var heroSection: some View {
        VStack(spacing: Spacing.s4) {
            Text("SwiftUI Fixture")
                .font(.threeXl)
                .foregroundColor(.textPrimary)
            Text("Design system test fixture for the design-extractor skill.")
                .font(.base)
                .foregroundColor(.textSecondary)
            HStack(spacing: Spacing.s3) {
                AppButton(label: "Primary Action", variant: .primary)
                AppButton(label: "Secondary", variant: .secondary)
            }
        }
        .padding(Spacing.s8)
        .frame(maxWidth: .infinity)
        .background(Color.surface)
    }

    private var componentsSection: some View {
        VStack(spacing: Spacing.s4) {
            CardView(title: "Card Title") { Text("Card body text with default styling.") }
            CardView(title: "Another Card") { Text("Secondary content example.") }
        }
        .padding(.horizontal, Spacing.s4)
    }
}
