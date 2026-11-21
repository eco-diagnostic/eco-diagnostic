import React from "react";
import { Pressable } from "react-native";
import { Tabs } from "expo-router";
import { Home, LayoutDashboard, History } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SoundToggle from "../../src/components/SoundToggle";

/**
 * Abas inferiores do app (ergonomia mobile-first):
 * index → Início | dashboard → Painel ESG | history → Histórico
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#9ca3af",
        // Botão de aba simples (Pressable sem android_ripple): evita o ripple cinza do Android
        tabBarButton: (props) => {
          const { children, style, onPress, onLongPress, accessibilityState, accessibilityLabel, testID } =
            props as any;
          return (
            <Pressable
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              accessibilityLabel={accessibilityLabel}
              testID={testID}
              style={style}
            >
              {children}
            </Pressable>
          );
        },
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          height: 56 + Math.max(insets.bottom, 6),
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        headerStyle: { backgroundColor: "#ffffff" },
        headerTitleStyle: { fontWeight: "bold", color: "#111827" },
        headerShadowVisible: false,
        headerRight: () => <SoundToggle />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarLabel: "Início",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerTitle: "Eco Diagnóstico",
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Painel ESG",
          tabBarLabel: "Painel",
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
          headerTitle: "Métricas de Sustentabilidade",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Histórico",
          tabBarLabel: "Histórico",
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
          headerTitle: "Histórico de Avaliações",
        }}
      />
    </Tabs>
  );
}
