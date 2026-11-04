import React from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useShoppingList } from '../hooks/useShoppingList';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

export const ProductListScreen: React.FC<Props> = ({ navigation, route }) => {
  const businessIdFilter = route.params?.businessId;
  const businessNameFilter = route.params?.businessName;

  const {
    products,
    loading,
    refresh,
    togglePurchased,
    removeProduct,
    totalEstimated,
    totalPurchased,
    totalPending,
  } = useShoppingList(businessIdFilter);

  // Recarrega sempre que a tela entra em foco (ex: voltando do cadastro/edição)
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Remover item',
      `Deseja remover "${name}" da lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeProduct(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={
          businessNameFilter
            ? `Compras: ${businessNameFilter}`
            : 'Minha Lista de Compras'
        }
      />

      {/* Resumo Financeiro / Total Estimado da Compra */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Estimado</Text>
          <Text style={styles.summaryValueTotal}>
            R$ {totalEstimated.toFixed(2).replace('.', ',')}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Comprado</Text>
          <Text style={styles.summaryValueDone}>
            R$ {totalPurchased.toFixed(2).replace('.', ',')}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pendente</Text>
          <Text style={styles.summaryValuePending}>
            R$ {totalPending.toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>

      {businessNameFilter ? (
        <View style={styles.filterBanner}>
          <Text style={styles.filterBannerText}>
            Filtrado por: <Text style={{ fontWeight: 'bold' }}>{businessNameFilter}</Text>
          </Text>
          <TouchableOpacity onPress={() => navigation.setParams({ businessId: undefined, businessName: undefined })}>
            <Text style={styles.clearFilterText}>Ver Todos</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Sua lista de compras está vazia</Text>
            <Text style={styles.emptySubtext}>
              Cadastre pão, leite, frutas e outros produtos dos comércios do bairro tocando no botão "+".
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                onTogglePurchased={() => togglePurchased(item.id)}
                onDelete={() => confirmDelete(item.id, item.name)}
              />
            )}
          />
        )}
      </View>

      {/* FAB para Adicionar Produto */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate('ProductForm', {
            businessId: businessIdFilter,
            businessName: businessNameFilter,
          })
        }
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  summaryValueTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.secondary,
  },
  summaryValueDone: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  summaryValuePending: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
  },
  filterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    borderRadius: 6,
  },
  filterBannerText: {
    fontSize: 12,
    color: colors.text,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  content: { flex: 1, paddingHorizontal: spacing.md },
  listPadding: { paddingTop: spacing.sm, paddingBottom: 80 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
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
