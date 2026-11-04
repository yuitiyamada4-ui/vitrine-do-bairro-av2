import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Header } from '../components/Header';
import { colors, spacing, borderRadius } from '../theme/colors';
import { apiService } from '../services/api';
import { Business, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getBusinesses();
      setBusinesses(data);
    } catch {
      setError('Não foi possível carregar os comerciantes do bairro. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Vitrine do Bairro" />

      <View style={styles.content}>
        {/* Banner de Boas-Vindas */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Minha Lista de Compras Inteligente 🛒</Text>
          <Text style={styles.welcomeSubtitle}>
            Organize suas compras associando produtos aos comércios locais do seu bairro.
          </Text>
          <TouchableOpacity
            style={styles.allProductsButton}
            onPress={() => navigation.navigate('ProductList')}
          >
            <Text style={styles.allProductsButtonText}>📋 Acessar Lista Completa</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Comércios Locais Cadastrados</Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingMessage}>Carregando comerciantes da Vitrine...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadBusinesses}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={businesses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.businessCard}
                onPress={() =>
                  navigation.navigate('ProductList', {
                    businessId: item.id,
                    businessName: item.name,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.businessHeader}>
                  <View style={styles.businessIconContainer}>
                    <Text style={styles.businessIcon}>🏪</Text>
                  </View>
                  <View style={styles.businessInfo}>
                    <Text style={styles.businessName}>{item.name}</Text>
                    <Text style={styles.businessCategory}>{item.category}</Text>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </View>

                {item.address ? (
                  <Text style={styles.businessAddress} numberOfLines={1}>
                    📍 {item.address}
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <Text style={styles.filterHint}>Toque para ver itens desta loja</Text>
                  <TouchableOpacity
                    style={styles.quickAddButton}
                    onPress={() =>
                      navigation.navigate('ProductForm', {
                        businessId: item.id,
                        businessName: item.name,
                      })
                    }
                  >
                    <Text style={styles.quickAddText}>+ Adicionar Item</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum comerciante encontrado no bairro.</Text>
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm', {})}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  loadingMessage: { marginTop: 10, color: colors.textLight, fontSize: 14 },
  welcomeCard: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  allProductsButton: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  allProductsButtonText: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  listPadding: { paddingBottom: 80 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 15,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
  businessCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  businessIcon: {
    fontSize: 20,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  businessCategory: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  arrowIcon: {
    fontSize: 24,
    color: colors.textLight,
    paddingHorizontal: 4,
  },
  businessAddress: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: spacing.xs,
    paddingLeft: 48,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  filterHint: {
    fontSize: 11,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  quickAddButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  quickAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 40,
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: colors.white,
    fontWeight: '300',
    marginTop: -2,
  },
});
