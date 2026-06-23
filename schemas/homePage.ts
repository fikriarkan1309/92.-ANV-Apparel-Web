export default {
  name: 'homePage',
  title: 'Halaman Beranda (Home Page Settings)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Judul Konfigurasi',
      type: 'string',
      description: 'Used only for identification, e.g., "Main Home Settings"'
    },
    {
      name: 'heroTagline',
      title: 'Hero Tagline (Atas)',
      type: 'string',
      description: 'e.g., "100% SUBLIMASI HIGH DEFINITION PRESISI"'
    },
    {
      name: 'heroTitle',
      title: 'Hero Title (Judul Utama)',
      type: 'string',
      description: 'Main display title.'
    },
    {
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
      description: 'Paragraph content under the hero title'
    },
    {
      name: 'heroCtaText',
      title: 'Hero CTA Button Text',
      type: 'string',
      description: 'e.g., "Lacak Live Order"'
    },
    {
      name: 'heroCtaLink',
      title: 'Hero CTA Link Target',
      type: 'string',
      description: 'Button direct link, e.g. "#section-tracking" or "#section-catalog"'
    },
    {
      name: 'heroImages',
      title: 'Hero Carousel / Marquee Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Upload multiple jersey banners/photos to cycle through in the marquee hero banner'
    },
    {
      name: 'aboutBadge',
      title: 'About Section Badge',
      type: 'string',
      description: 'e.g., "Konveksi Profesional Kelas Juara"'
    },
    {
      name: 'aboutTitle',
      title: 'About Section Title',
      type: 'string',
      description: 'Heading for the About US section'
    },
    {
      name: 'aboutDescription',
      title: 'About Section Description',
      type: 'text',
      description: 'Long block content of the About US section'
    },
    {
      name: 'aboutImage',
      title: 'About Section Image',
      type: 'image',
      description: 'Directly upload high resolution industrial press/workshop image.',
      options: {
        hotspot: true
      }
    },
    {
      name: 'aboutStatDpi',
      title: 'About Stat 1 Value',
      type: 'string',
      description: 'e.g. "1200+ DPI"'
    },
    {
      name: 'aboutStatDpiDesc',
      title: 'About Stat 1 Description',
      type: 'string',
      description: 'e.g. "Kejelasan detail & kerataan warna Epson TrueColor"'
    },
    {
      name: 'aboutStatSla',
      title: 'About Stat 2 Value',
      type: 'string',
      description: 'e.g. "99.8%"'
    },
    {
      name: 'aboutStatSlaDesc',
      title: 'About Stat 2 Description',
      type: 'string',
      description: 'e.g. "SLA Pengerjaan On-Time terdaftar"'
    },
    {
      name: 'uspBadge',
      title: 'USP Section Badge',
      type: 'string',
      description: 'e.g., "Keunggulan Kami"'
    },
    {
      name: 'uspTitle',
      title: 'USP Section Title',
      type: 'string',
      description: 'e.g., "Kenapa Mempercayakan ANV Apparel?"'
    },
    {
      name: 'uspDescription',
      title: 'USP Section Description',
      type: 'text',
      description: 'e.g., "Detail yang kami jaga menjadikan setiap jersey serasa seragam tim profesional..."'
    },
    {
      name: 'uspItems',
      title: 'USP Benefit Cards',
      type: 'array',
      description: 'Up to 3 special benefits/features cards.',
      of: [
        {
          type: 'object',
          name: 'uspItem',
          title: 'USP Benefit Item',
          fields: [
            { name: 'title', title: 'Judul Keunggulan', type: 'string' },
            { name: 'description', title: 'Deskripsi Keunggulan', type: 'text' },
            { name: 'icon', title: 'Nama Icon (dari Lucide-react, e.g. Zap, Shield, Clock)', type: 'string' }
          ]
        }
      ]
    },
    {
      name: 'whatsappNumber',
      title: 'WhatsApp Phone Number',
      type: 'string',
      description: 'Phone number in international format, e.g. "6281234567890". This updates all WhatsApp links in navbar and page.'
    },
    {
      name: 'faqs',
      title: 'Daftar FAQ (Pertanyaan Umum)',
      type: 'array',
      description: 'Manage FAQ questions and answers',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          title: 'FAQ Question-Answer Pair',
          fields: [
            { name: 'question', title: 'Pertanyaan', type: 'string' },
            { name: 'answer', title: 'Jawaban Lengkap', type: 'text' }
          ]
        }
      ]
    }
  ]
}
