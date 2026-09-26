# Custom Hooks Documentation

Koleksi custom hooks yang dapat digunakan kembali untuk menyederhanakan pengelolaan state dalam aplikasi React.

## 📋 Daftar Hooks

### 1. `useDialogState`
Hook untuk mengelola state dialog/modal dengan berbagai mode operasi.

#### Features:
- ✅ Mengelola state open/close dialog
- ✅ Mode operasi: create, edit, view, delete
- ✅ Selected data management
- ✅ Auto-reset setelah dialog ditutup

#### Usage:
```typescript
import { useDialogState } from '@/hooks';

const MyComponent = () => {
  const {
    isOpen,
    selectedData,
    mode,
    onCreateOpen,
    onEditOpen,
    onViewOpen,
    onDeleteOpen,
    onClose,
  } = useDialogState<User>();

  return (
    <div>
      <button onClick={onCreateOpen}>Add User</button>
      <button onClick={() => onEditOpen(userData)}>Edit</button>
      {/* Dialog component */}
    </div>
  );
};
```

### 2. `useDataQuery`
Hook untuk mengelola data fetching dengan React Query dan helper functions.

#### Features:
- ✅ Konfigurasi query yang fleksibel
- ✅ Helper functions: `isEmpty`, `hasData`
- ✅ Default cache dan stale time
- ✅ Support untuk API response standar

#### Usage:
```typescript
import { useApiDataQuery } from '@/hooks';

const MyComponent = () => {
  const {
    data,
    isLoading,
    error,
    isEmpty,
    hasData,
    extractedData
  } = useApiDataQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return <UserList data={extractedData} />;
};
```

### 3. `useTableData`
Hook untuk mengelola table data dengan dialog actions terintegrasi.

#### Features:
- ✅ Table column management dengan callbacks
- ✅ Dialog state terintegrasi
- ✅ Helper booleans untuk mode checking
- ✅ Auto memoization untuk performa

#### Usage:
```typescript
import { useTableData } from '@/hooks';

const MyComponent = () => {
  const {
    isDialogOpen,
    selectedData,
    columns,
    tableData,
    onCreateOpen,
    onEditOpen,
    onViewOpen,
    onDeleteOpen,
    onDialogClose,
    isView,
    isEdit,
    isDelete,
  } = useTableData<User>({
    data: users,
    columnsFactory: (callbacks) => createColumns(callbacks),
  });

  return (
    <>
      <DataTable 
        data={tableData} 
        columns={columns}
        onAdd={onCreateOpen}
      />
      <UserDialog 
        isOpen={isDialogOpen}
        onClose={onDialogClose}
        data={selectedData}
        isView={isView}
      />
    </>
  );
};
```

### 4. `useFormState`
Hook untuk mengelola form state dengan mutations dan error handling.

#### Features:
- ✅ Create, Update, Delete mutations
- ✅ Loading states untuk setiap operation
- ✅ Error handling terintegrasi
- ✅ Toast notifications
- ✅ Query invalidation

#### Usage:
```typescript
import { useFormState } from '@/hooks';

const MyForm = () => {
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting,
  } = useFormState<User>({
    createFn: createUser,
    updateFn: updateUser,
    deleteFn: deleteUser,
    queryKey: ['users'],
    messages: {
      createSuccess: 'User berhasil ditambahkan',
      updateSuccess: 'User berhasil diperbarui',
      deleteSuccess: 'User berhasil dihapus',
    },
  });

  const handleSubmit = (data: User) => {
    if (isEdit) {
      updateMutation(data);
    } else {
      createMutation(data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};
```

### 5. `useCrudOperations` ⭐ (Recommended)
Hook komprehensif yang menggabungkan semua operasi CRUD dalam satu hook.

#### Features:
- ✅ Complete CRUD operations
- ✅ Data fetching terintegrasi  
- ✅ Table management
- ✅ Dialog state management
- ✅ Form mutations
- ✅ Error handling & loading states
- ✅ Toast notifications

#### Usage:
```typescript
import { useCrudOperations } from '@/hooks';

const MyView = () => {
  const {
    // Data state
    isLoading,
    isFetching,
    error,
    hasData,
    
    // Table state
    isDialogOpen,
    selectedData,
    columns,
    tableData,
    
    // Dialog handlers
    onCreateOpen,
    onEditOpen,
    onViewOpen,
    onDeleteOpen,
    onDialogClose,
    
    // Actions
    handleFormSubmit,
    handleDelete,
    isSubmitting,
    
    // Helper booleans
    isView,
    isEdit,
    isDelete,
    isCreate,
  } = useCrudOperations<User>({
    queryKey: queryKeys.users.all,
    queryFn: () => getUsers(),
    createFn: createUser,
    updateFn: updateUser,
    deleteFn: deleteUser,
    columnsFactory: (callbacks) => createColumns(callbacks),
    messages: {
      createSuccess: 'User berhasil ditambahkan',
      updateSuccess: 'User berhasil diperbarui',
      deleteSuccess: 'User berhasil dihapus',
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <>
      <DataTable 
        data={tableData} 
        columns={columns}
        onAdd={onCreateOpen}
      />
      <UserForm
        isOpen={isDialogOpen}
        onClose={onDialogClose}
        data={selectedData}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
        isView={isView}
        isEdit={isEdit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
```

## 🚀 Migration Guide

### Before (Original Code)
```typescript
// 70+ lines of repetitive code
export default function UserView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isView, setIsView] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => getUsers(),
  });

  const onDeleteOpen = useCallback((data) => {
    setSelected(data);
    setIsDialogOpen(true);
    setIsDeleted(true);
  }, []);

  const onEditOpen = useCallback((data) => {
    setSelected(data);
    setIsDialogOpen(true);
  }, []);

  const onViewOpen = useCallback((data) => {
    setSelected(data);
    setIsDialogOpen(true);
    setIsView(true);
  }, []);

  const columns = useMemo(
    () => Columns({ onEditOpen, onDeleteOpen, onViewOpen }),
    [onEditOpen, onDeleteOpen, onViewOpen]
  );

  // ... rest of the repetitive code
}
```

### After (Using useCrudOperations)
```typescript
// 30+ lines of clean code
export default function UserView() {
  const {
    isLoading,
    error,
    isDialogOpen,
    selectedData,
    columns,
    tableData,
    onCreateOpen,
    onDialogClose,
    handleFormSubmit,
    handleDelete,
    isView,
    isEdit,
    isSubmitting,
  } = useCrudOperations<User>({
    queryKey: queryKeys.users.all,
    queryFn: () => getUsers(),
    createFn: createUser,
    updateFn: updateUser,
    deleteFn: deleteUser,
    columnsFactory: (callbacks) => Columns(callbacks),
  });

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <>
      <DataTable data={tableData} columns={columns} onAdd={onCreateOpen} />
      <UserForm
        isOpen={isDialogOpen}
        onClose={onDialogClose}
        data={selectedData}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
        isView={isView}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
```

## 📊 Benefits

### Code Reduction
- **70% less boilerplate code**
- **Consistent patterns** across all views
- **Better maintainability**

### Performance
- **Automatic memoization** for callbacks dan columns
- **Optimized re-renders**
- **Smart query invalidation**

### Developer Experience
- **Type-safe** dengan full TypeScript support
- **Auto-complete** untuk semua properties
- **Centralized error handling**
- **Consistent loading states**

### Scalability
- **Easy to extend** dengan features baru
- **Reusable patterns** untuk semua entities
- **Standardized approach** untuk team development

## 🔧 Advanced Usage

### Custom Query Options
```typescript
const crud = useCrudOperations({
  // ... other config
  enabled: true,
  gcTime: 600000, // 10 minutes
  staleTime: 60000, // 1 minute
});
```

### Custom Messages
```typescript
const crud = useCrudOperations({
  // ... other config
  messages: {
    createSuccess: 'Data berhasil disimpan!',
    updateSuccess: 'Perubahan berhasil disimpan!',
    deleteSuccess: 'Data berhasil dihapus!',
  },
});
```

### Conditional Operations
```typescript
const crud = useCrudOperations({
  // ... other config
  createFn: canCreate ? createUser : undefined,
  updateFn: canUpdate ? updateUser : undefined,
  deleteFn: canDelete ? deleteUser : undefined,
});
```

## 🎯 Best Practices

1. **Use useCrudOperations** untuk kebanyakan use cases
2. **Use individual hooks** hanya jika perlu customization khusus
3. **Always provide proper TypeScript types** untuk better DX
4. **Customize messages** untuk user experience yang lebih baik
5. **Handle loading states** dengan proper UI feedback

## 🐛 Troubleshooting

### Common Issues

#### 1. Type Errors
```typescript
// ❌ Wrong
const crud = useCrudOperations({...});

// ✅ Correct
const crud = useCrudOperations<User>({...});
```

#### 2. Missing Query Key
```typescript
// ❌ Wrong - queryKey as array
queryKey: 'users'

// ✅ Correct - queryKey as readonly array
queryKey: queryKeys.users.all
```

#### 3. Columns Factory
```typescript
// ❌ Wrong - direct columns
columns: userColumns

// ✅ Correct - columns factory function
columnsFactory: (callbacks) => userColumns(callbacks)
```

## 📝 Notes

- Hooks ini menggunakan React Query untuk data management
- Toast notifications menggunakan useStatusUtils yang sudah ada
- Semua hooks sudah dioptimasi untuk performance
- Type definitions lengkap untuk development experience yang baik

Dengan menggunakan hooks ini, development menjadi lebih cepat, consistent, dan maintainable! 🎉
