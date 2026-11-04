import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Header } from '../components/Header';
import { colors, spacing, borderRadius } from '../theme/colors';
import { storageService } from '../services/storage';
import { Product, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    const products = await storageService.getProducts();
    const found = products.find(p => p.id === productId);
    setProduct(found || null);
    setLoading(false);
  };

  const togglePurchased = async () => {
    if (!product) return;
    const newState = !product.isPurchased;
    await storageService.updateProduct(product.id, { isPurchased: newState });
    setProduct({ ...product, isPurchased: newState });
  };

  const handleDelete = () => {
    if (!product) return;
    Alert.alert(
      'Remover Produto',
      `Deseja realmente remover "${product.name}" da lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await storageService.deleteProduct(product.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Detalhes do Produto" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Detalhes do Produto" />
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundText}>Produto não encontrado.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalItem = product.price * product.quantity;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Detalhes do Item" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, product.isPurchased ? styles.statusPurchased : styles.statusPending]}>
              {product.isPurchased ? '✅ ITEM COMPRADO' : '⏳ PENDENTE DE COMPRA'}
            </Text>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.categoryBadge}>{product.category}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Preço unitário:</Text>
            <Text style={styles.infoValue}>R$ {product.price.toFixed(2).replace('.', ',')}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantidade planejada:</Text>
            <Text style={styles.infoValue}>{product.quantity} un.</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabelBold}>Subtotal estimado:</Text>
            <Text style={styles.infoTotal}>R$ {totalItem.toFixed(2).replace('.', ',')}</Text>
          </View>

          {product.businessName ? (
            <>
              <View style={styles.divider} />
              <View style={styles.businessBox}>
                <Text style={styles.businessBoxTitle}>🏪 Comércio do Bairro:</Text>
                <Text style={styles.businessBoxName}>{product.businessName}</Text>
              </View>
            </>
          ) : null}

          {product.description ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.descriptionLabel}>Observações:</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.actionButton, product.isPurchased ? styles.uncheckButton : styles.checkButton]}
          onPress={togglePurchased}
        >
          <Text style={styles.actionButtonText}>
            {product.isPurchased ? 'Marcar como Pendente' : 'Marcar como Comprado'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('ProductForm', { productId: product.id })}
        >
          <Text style={styles.editButtonText}>✏️ Editar Dados do Item</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑️ Remover da Lista</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  notFoundText: { fontSize: 16, color: colors.textLight, marginBottom: spacing.md },
  backButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backButtonText: { color: colors.white, fontWeight: 'bold' },
  content: { padding: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    marginBottom: spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: spacing.sm,
    backgroundColor: '#F5F5F5',
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusPurchased: { color: '#2E7D32' },
  statusPending: { color: '#E65100' },
  productName: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  categoryBadge: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoLabel: { fontSize: 14, color: colors.textLight },
  infoValue: { fontSize: 15, fontWeight: '600', color: colors.text },
  infoLabelBold: { fontSize: 15, fontWeight: '700', color: colors.text },
  infoTotal: { fontSize: 18, fontWeight: '800', color: colors.secondary },
  businessBox: {
    backgroundColor: '#F9FBE7',
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  businessBoxTitle: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  businessBoxName: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
  descriptionLabel: { fontSize: 13, fontWeight: '600', color: colors.textLight, marginBottom: 4 },
  descriptionText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  actionButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkButton: { backgroundColor: '#4CAF50' },
  uncheckButton: { backgroundColor: '#FF9800' },
  actionButtonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  editButton: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  editButtonText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteButtonText: { color: colors.error, fontSize: 15, fontWeight: '600' },
});
