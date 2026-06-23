export default {
  name: 'productCatalog',
  title: 'Katalog Produk (Product Categories)',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'Short ID',
      type: 'string',
      description: 'Internal anchor ID, e.g., "cat-futsal"'
    },
    {
      name: 'name',
      title: 'Nama Kategori',
      type: 'string',
      description: 'e.g., "Jersey Futsal & Bola"'
    },
    {
      name: 'category',
      title: 'Kategori / Label Singkat',
      type: 'string',
      description: 'e.g., "Futsal"'
    },
    {
      name: 'image',
      title: 'Foto Utama Produk',
      type: 'image',
      description: 'Directly upload catalog banner image.',
      options: {
        hotspot: true
      }
    },
    {
      name: 'description',
      title: 'Penjelasan Kategori',
      type: 'text',
      description: 'e.g., "Desain custom sublimasi penuh dari kerah ke celana..."'
    },
    {
      name: 'priceEstimate',
      title: 'Estimasi Harga',
      type: 'string',
      description: 'e.g., "Mulai dari Rp 125.000 / Setel"'
    }
  ]
}
