import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Video,
  Music,
  FileText,
  Image as ImageIcon,
  UserX,
  ArrowRight,
  Zap
} from 'lucide-react';

const tools = [
  {
    id: 'video',
    icon: <Video size={24} />,
    titleKey: 'tools.video.title',
    descKey: 'tools.video.description',
    gradient: 'from-cyan-400 to-blue-600',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    path: '/detector'
  },
  {
    id: 'audio',
    icon: <Music size={24} />,
    titleKey: 'tools.audio.title',
    descKey: 'tools.audio.description',
    gradient: 'from-purple-400 to-pink-600',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    path: '/audio-detector'
  },
  {
    id: 'text',
    icon: <FileText size={24} />,
    titleKey: 'tools.text.title',
    descKey: 'tools.text.description',
    gradient: 'from-orange-400 to-red-600',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    path: '/text-detector'
  },
  {
    id: 'image',
    icon: <ImageIcon size={24} />,
    titleKey: 'tools.image.title',
    descKey: 'tools.image.description',
    gradient: 'from-teal-400 to-green-600',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    path: '/image-detector'
  },
  {
    id: 'accounts',
    icon: <UserX size={24} />,
    titleKey: 'tools.accounts.title',
    descKey: 'tools.accounts.description',
    gradient: 'from-blue-400 to-indigo-600',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    path: '/account-detector'
  },
  {
    id: 'multimodal',
    icon: <Zap size={24} />,
    titleKey: 'multimodal.title',
    descKey: 'multimodal.subtitle',
    gradient: 'from-indigo-400 to-purple-600',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    path: '/multimodal-detector'
  },
  // {
  //   id: 'deepsearch',
  //   icon: <Search size={24} />,
  //   titleKey: 'tools.deepsearch.title',
  //   descKey: 'tools.deepsearch.description',
  //   gradient: 'from-slate-400 to-slate-600',
  //   color: 'text-slate-600 dark:text-slate-400',
  //   bgColor: 'bg-slate-50 dark:bg-slate-800/50',
  //   path: '#'
  // }
];

export function DetectionTools() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="py-24 px-6 bg-surface-soft">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-content-main">
            {t('tools.title')}
          </h2>
          <div className="h-1.5 w-20 bg-brand-primary rounded-full mt-4" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className="group relative bg-surface-main rounded-2xl shadow-soft-xl border border-border-subtle overflow-hidden transition-all duration-300"
            >
              {/* Top Border Accent */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tool.gradient}`} />

              <div className="p-8 flex flex-col h-full relative z-10">
                {/* Icon Holder */}
                <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center ${tool.color} mb-6 transition-transform group-hover:scale-110 duration-300`}>
                  {tool.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-content-main mb-3">
                  {t(tool.titleKey)}
                </h3>
                <p className="text-content-muted mb-8 line-clamp-2 leading-relaxed">
                  {t(tool.descKey)}
                </p>

                {/* CTA */}
                <div className="mt-auto">
                  <Link to={tool.path} className="flex items-center gap-2 text-sm font-bold text-brand-primary group/btn transition-all duration-300">
                    <span className="relative pb-1">
                      {t('tools.cta')}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover/btn:w-full" />
                    </span>
                    <ArrowRight size={18} className="transition-transform duration-300 group-hover/btn:translate-x-2 rtl:-scale-x-100 rtl:group-hover/btn:-translate-x-2" />
                  </Link>
                </div>
              </div>

              {/* Hover Highlight Area */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
