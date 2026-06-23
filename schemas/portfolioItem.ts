export default {
  name: 'portfolioItem',
  title: 'Portofolio Hasil Cetak (Portfolio Items)',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'Short ID',
      type: 'string',
      description: 'Unique identifier, e.g. "port-futsal-1"'
    },
    {
      name: 'title',
      title: 'Judul Tim / Karya',
      type: 'string',
      description: 'e.g. "Sriwijaya Futsal Club"'
    },
    {
      name: 'category',
      title: 'Kategori Olahraga',
      type: 'string',
      description: 'e.g., "Futsal", "Basket", "Voli"'
    },
    {
      name: 'image',
      title: 'Foto Jepretan Asli',
      type: 'image',
      description: 'Directly upload high quality photo from factory or studio.',
      options: {
        hotspot: true
      }
    },
    {
      name: 'collarDetail',
      title: 'Detail Model Kerah',
      type: 'string',
      description: 'e.g., "Kerah bermodel V-Neck rib karet custom"'
    },
    {
      name: 'stitchDetail',
      title: 'Detail Jenis Jahitan',
      type: 'string',
      description: 'e.g., "Jahit rantai pundak ganda sport-grade ultra kuat"'
    },
    {
      name: 'sharpnessDetail',
      title: 'Detail Kualitas Cetak',
      type: 'string',
      description: 'e.g., "Gradasi TrueColor Epson 1200 DPI anti bintik"'
    }
  ]
}
