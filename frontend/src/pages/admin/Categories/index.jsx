import { useState, useEffect } from 'react'
import { getCategories, updateCategoryThumbnail } from '@/services/api'
import useToastStore from '@/store/toastStore'
import { AdminPage, AdminCard, AdminTable, Tr, Td, AdminBtn } from '@/admin/AdminUI'
import { uploadAdminImage } from '@/services/adminApi'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToastStore()
  
  // Track upload status per category
  const [uploadingFor, setUploadingFor] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      addToast({ message: 'Failed to load categories', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e, categoryId) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addToast({ message: 'Please select an image file', type: 'error' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast({ message: 'Image must be under 2MB', type: 'error' })
      return
    }

    try {
      setUploadingFor(categoryId)
      const uploadRes = await uploadAdminImage(file)
      
      if (uploadRes.url) {
        await updateCategoryThumbnail(categoryId, uploadRes.url)
        addToast({ message: 'Thumbnail updated', type: 'success' })
        loadCategories()
      } else {
        throw new Error('Upload failed')
      }
    } catch (err) {
      console.error(err)
      addToast({ message: 'Failed to update thumbnail', type: 'error' })
    } finally {
      setUploadingFor(null)
      // Reset input
      e.target.value = ''
    }
  }

  return (
    <AdminPage>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-bold text-admin-navy">Manage Categories</h1>
      </div>

      <AdminCard subtitle="Set universal thumbnails for product categories">
        <AdminTable
          headers={[
            { label: 'Category', className: 'w-[40%]' },
            { label: 'Slug', className: 'w-[30%]' },
            { label: 'Thumbnail', className: 'w-[30%]' }
          ]}
          emptyMessage={loading ? 'Loading categories...' : 'No categories found.'}
        >
          {categories.map((cat) => (
            <Tr key={cat.id} className="h-[80px]">
              <Td>
                <span className="font-bold text-admin-navy">{cat.name}</span>
              </Td>
              <Td>
                <span className="text-admin-text-sub font-mono text-[11px] bg-admin-seafoam px-2 py-1 rounded">{cat.slug}</span>
              </Td>
              <Td>
                <div className="flex items-center gap-4">
                  {cat.category_thumbnail ? (
                    <img 
                      src={cat.category_thumbnail} 
                      alt={cat.name} 
                      className="w-16 h-16 rounded-[8px] object-cover border border-admin-border/50" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-[8px] bg-admin-seafoam border border-admin-border/50 flex flex-col items-center justify-center text-admin-text-sub">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>image</span>
                      <span className="text-[9px]">None</span>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, cat.id)}
                      disabled={uploadingFor === cat.id}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <AdminBtn 
                      variant="secondary" 
                      size="sm" 
                      icon={uploadingFor === cat.id ? 'sync' : 'upload'}
                      disabled={uploadingFor === cat.id}
                      className={uploadingFor === cat.id ? 'opacity-75 pointer-events-none' : ''}
                    >
                      {uploadingFor === cat.id ? 'Uploading...' : 'Upload'}
                    </AdminBtn>
                  </div>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      </AdminCard>
    </AdminPage>
  )
}
