import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onTogglePurchased?: () => void;
  onDelete?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onTogglePurchased,
  onDelete,
}) => {
  const itemTotal = product.price * product.quantity;

  return (
    <TouchableOpacity
      style={[styles.card, product.isPurchased && styles.cardPurchased]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onTogglePurchased}
            style={styles.checkboxContainer}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[styles.checkbox, product.isPurchased && styles.checkboxActive]}>
              <Text style={styles.checkboxIcon}>
                {product.isPurchased ? '✓' : ''}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.titleArea}>
            <Text
              style={[styles.name, product.isPurchased && styles.textPurchased]}
              numberOfLines={1}
            >
              {product.name}
            </Text>
            <View style={styles.badgeRow}>
              <Text style={styles.categoryBadge}>{product.category}</Text>
              {product.businessName ? (
                <Text style={styles.businessBadge} numberOfLines={1}>
                  🏪 {product.businessName}
                </Text>
              ) : null}
            </View>
          </View>

          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.quantity}>Qtd: {product.quantity}x</Text>
          <Text style={styles.unitPrice}>
            (R$ {product.price.toFixed(2).replace('.', ',')} un.)
          </Text>
          <Text style={styles.totalPrice}>
            Total: R$ {itemTotal.toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPurchased: {
    backgroundColor: '#F1F8E9',
    borderColor: '#C8E6C9',
  },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  checkboxContainer: {
    marginRight: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  checkboxActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxIcon: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  titleArea: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  textPurchased: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 3,
  },
  categoryBadge: {
    fontSize: 11,
    color: colors.primary,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  businessBadge: {
    fontSize: 11,
    color: colors.textLight,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 1,
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  deleteText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  quantity: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  unitPrice: {
    fontSize: 12,
    color: colors.textLight,
    flex: 1,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
  },
});
