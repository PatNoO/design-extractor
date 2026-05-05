import SwiftUI

struct DashboardView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.s6) {
                Text("Dashboard")
                    .font(.twoXl)
                    .foregroundColor(.textPrimary)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: Spacing.s6) {
                    CardView(title: "Users") {
                        Text("1,240").font(.twoXl).foregroundColor(.primary)
                    }
                    CardView(title: "Revenue") {
                        Text("$48k").font(.twoXl).foregroundColor(.success)
                    }
                    CardView(title: "Errors") {
                        Text("3 active").font(.sm).foregroundColor(.error)
                    }
                }
            }
            .padding(Spacing.s8)
        }
        .background(Color.background)
        .navigationTitle("Dashboard")
    }
}
