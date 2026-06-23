export default {
  name: 'guidePage',
  title: 'Halaman Panduan (Guide & Sizing Page Settings)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Judul Konfigurasi',
      type: 'string',
      description: 'Used only for identification, e.g., "Main Guide & Sizing Settings"'
    },
    {
      name: 'badge',
      title: 'Guide Page Badge',
      type: 'string',
      description: 'e.g., "Book of Sports Textile"'
    },
    {
      name: 'pageTitle',
      title: 'Guide Page Title',
      type: 'string',
      description: 'e.g., "Panduan Bahan & Ukuran"'
    },
    {
      name: 'pageDescription',
      title: 'Guide Page Description',
      type: 'text',
      description: 'Subtitle / description at the top of the guide page'
    },
    {
      name: 'materialsHeading',
      title: 'Materials Section Heading',
      type: 'string',
      description: 'e.g., "Katalog Tekstur Kain Premium ANV"'
    },
    {
      name: 'materialsSubheading',
      title: 'Materials Section Subheading',
      type: 'string',
      description: 'e.g., "Setiap jenis aktivitas olahraga menuntut anyaman serat dryfit spesifik"'
    },
    {
      name: 'calculatorHeading',
      title: 'Sizing Calculator Title',
      type: 'string',
      description: 'e.g., "Smart Size Recommender"'
    },
    {
      name: 'calculatorDescription',
      title: 'Sizing Calculator Description',
      type: 'text',
      description: 'Instructions under the size calculator title.'
    },
    {
      name: 'sizeTableHeading',
      title: 'Sizing Table Section Heading',
      type: 'string',
      description: 'e.g., "Tabel Sizing Chart ANV (Standar Lokal)"'
    }
  ]
}
