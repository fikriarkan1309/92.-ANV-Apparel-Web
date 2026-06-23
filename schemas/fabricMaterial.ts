export default {
  name: 'fabricMaterial',
  title: 'Bahan Kain (Fabric Materials)',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'Short ID',
      type: 'string',
      description: 'Used for internal routing/anchoring, e.g., "dryfit-milano". Use lowercase letters and hyphens.'
    },
    {
      name: 'name',
      title: 'Nama Bahan',
      type: 'string',
      description: 'The display name, e.g. "Dryfit Milano"'
    },
    {
      name: 'description',
      title: 'Deskripsi Singkat',
      type: 'string',
      description: 'Short single-sentence dynamic overlay description'
    },
    {
      name: 'fullDescription',
      title: 'Deskripsi Lengkap',
      type: 'text',
      description: 'Complete block text describing the material features and backstory.'
    },
    {
      name: 'image',
      title: 'Close-up Image / Foto Bahan',
      type: 'image',
      description: 'Upload a clear high-resolution fabric texture image directly.',
      options: {
        hotspot: true
      }
    },
    {
      name: 'suitability',
      title: 'Kecocokan Aktivitas',
      type: 'string',
      description: 'e.g. "Sangat cocok untuk Sepak Bola, Futsal, dan Voli."'
    },
    {
      name: 'characteristics',
      title: 'Karakteristik Serat',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Add core bullet points of cloth features'
    }
  ]
}
