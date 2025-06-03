import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  category_id: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_url: string;
  subcategories: Subcategory[];
}

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType>({
  categories: [],
  loading: true,
  error: null,
  refreshCategories: async () => {},
});

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .order('name');

      if (subcategoriesError) throw subcategoriesError;

      // Organize data
      const organizedCategories = categoriesData.map(category => ({
        ...category,
        subcategories: subcategoriesData.filter(sub => sub.category_id === category.id)
      }));

      setCategories(organizedCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider value={{
      categories,
      loading,
      error,
      refreshCategories: fetchCategories
    }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};