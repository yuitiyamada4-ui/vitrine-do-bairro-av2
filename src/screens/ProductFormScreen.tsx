import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Header } from '../components/Header';
import { colors, spacing, borderRadius } from '../theme/colors';
import { storageService } from '../services/storage';
import { apiService } from '../services/api';
import { Product, Business, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductForm'>;

const PRESET_CATEGORIES = [
  'Padaria & Confeitaria',
  'Supermercado',
  'Hortifruti',
  'Carnes & Aves',
  'Farmácia',
  'Limpeza',
  'Bebidas',
  'Outros',
];

export const ProductFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { productId, businessId: initialBusinessId, businessName: initialBusinessName } = route.params || {};

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState(PRESET_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState(initialBusinessId || '');
  const [selectedBusinessName, setSelectedBusinessName] = useState(initialBusinessName || '');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  useEffect(() => {
    loadBusinesses();
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadBusinesses = async () => {
    try {
      const data = await apiService.getBusinesses();
      setBusinesses(data);
    } catch {
      // Ignora erro e continua com fallback
    }
  };

  const loadProduct = async () => {
    setLoadingInitial(true);
    const products = await storageService.getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
      setName(product.name);
      setPrice(product.price.toString().replace('.', ','));
      setQuantity(product.quantity.toString());
      setCategory(product.category);
      setDescription(product.description || '');
      if (product.businessId) setSelectedBusinessId(product.businessId);
      if (product.businessName) setSelectedBusinessName(product.businessName);
    }
    setLoadingInitial(false);
  };

  const selectBusiness = (business: Business) => {
    if (selectedBusinessId === business.id) {
      // Desmarca
      setSelectedBusinessId('');
      setSelectedBusinessName('');
    } else {
      setSelectedBusinessId(business.id);
      setSelectedBusinessName(business.name);
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Nome do produto é obrigatório (ex: Pão, Leite, Frutas)';
    }

    const normalizedPrice = price.trim().replace(',', '.');
    if (!normalizedPrice) {
      newErrors.price = 'Preço é obrigatório';
    } else if (isNaN(Number(normalizedPrice)) || Number(normalizedPrice) <= 0) {
      newErrors.price = 'Informe um preço válido maior que zero (ex: 4,50)';
    }

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 1) {
      newErrors.quantity = 'Quantidade mínima é 1';
    }

    if (!category.trim()) {
      newErrors.category = 'Selecione ou digite uma categoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Campos inválidos', 'Por favor, revise os campos destacados em vermelho.');
      return;
    }

    setLoading(true);

    try {
      const normalizedPrice = parseFloat(price.trim().replace(',', '.'));
      const qtyNum = parseInt(quantity, 10) || 1;

      const productData: Product = {
        id: productId || Date.now().toString(),
        name: name.trim(),
        price: normalizedPrice,
        quantity: qtyNum,
        category: category.trim(),
        description: description.trim(),
        isPurchased: false,
        businessId: selectedBusinessId || undefined,
        businessName: selectedBusinessName || undefined,
      };

      if (productId) {
        await storageService.updateProduct(productId, productData);
      } else {
        await storageService.addProduct(productData);
      }

      Alert.alert(
        'Sucesso!',
        `Produto ${productId ? 'atualizado' : 'adicionado'} à sua lista.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitial) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Carregando..." />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={productId ? 'Editar Item' : 'Novo Item na Lista'} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          {/* Nome */}
          <Text style={styles.label}>Produto / Item *</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : undefined]}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            placeholder="Ex: Pão Francês, Leite Desnatado, Maçã..."
            placeholderTextColor={colors.textLight}
          />
          {errors.name ? <Text style={styles.errorText}>⚠️ {errors.name}</Text> : null}

          {/* Preço e Quantidade */}
          <View style={styles.row}>
            <View style={[styles.column, { flex: 2 }]}>
              <Text style={styles.label}>Preço Unitário (R$) *</Text>
              <TextInput
                style={[styles.input, errors.price ? styles.inputError : undefined]}
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                }}
                placeholder="Ex: 5,50"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
              />
              {errors.price ? <Text style={styles.errorText}>⚠️ {errors.price}</Text> : null}
            </View>

            <View style={[styles.column, { flex: 1, marginLeft: spacing.sm }]}>
              <Text style={styles.label}>Quantidade *</Text>
              <TextInput
                style={[styles.input, errors.quantity ? styles.inputError : undefined]}
                value={quantity}
                onChangeText={(text) => {
                  setQuantity(text);
                  if (errors.quantity) setErrors(prev => ({ ...prev, quantity: '' }));
                }}
                placeholder="1"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
              />
              {errors.quantity ? <Text style={styles.errorText}>⚠️ {errors.quantity}</Text> : null}
            </View>
          </View>

          {/* Comerciante Associado */}
          <Text style={styles.label}>Associar a um Comerciante do Bairro</Text>
          <Text style={styles.sublabel}>Selecione a loja ou deixe avulso:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
            {businesses.map((biz) => {
              const isSelected = selectedBusinessId === biz.id;
              return (
                <TouchableOpacity
                  key={biz.id}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => selectBusiness(biz)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    🏪 {biz.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Categoria */}
          <Text style={styles.label}>Categoria *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
            {PRESET_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Observações / Descrição */}
          <Text style={styles.label}>Observações (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Marca preferida, ponto da carne, etc."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
          />

          {/* Botão de Salvar */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>
                💾 {productId ? 'Atualizar Item' : 'Salvar na Lista'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: spacing.md },
  form: { paddingBottom: spacing.xl },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    marginTop: spacing.md,
  },
  sublabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    minHeight: 46,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
    backgroundColor: '#FFEBEE',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    marginTop: 4,
  },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    minHeight: 50,
    justifyContent: 'center',
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
