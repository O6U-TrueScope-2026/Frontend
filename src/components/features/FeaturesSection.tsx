import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Activity, TrendingUp, Users } from 'lucide-react';

export function FeaturesSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isRTL ? 10 : -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="bg-surface-soft rounded-[2rem] shadow-soft-xl border border-border-subtle p-8 md:p-12 lg:p-16 transition-colors duration-300"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

          {/* Column A: How It Works */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-content-main mb-10">
              {t('features.how_it_works.title')}
            </h2>

            <div className="space-y-10">
              <BulletItem
                dotColor="bg-blue-500"
                title={t('features.how_it_works.step1_title')}
                description={t('features.how_it_works.step1_desc')}
                variants={itemVariants}
              />
              <BulletItem
                dotColor="bg-purple-500"
                title={t('features.how_it_works.step2_title')}
                description={t('features.how_it_works.step2_desc')}
                variants={itemVariants}
              />
              <BulletItem
                dotColor="bg-green-500"
                title={t('features.how_it_works.step3_title')}
                description={t('features.how_it_works.step3_desc')}
                variants={itemVariants}
              />
            </div>
          </div>

          {/* Column B: Why TrueScope? */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-content-main mb-10">
              {t('features.why_truescope.title')}
            </h2>

            <div className="space-y-10">
              <IconItem
                icon={<Activity size={24} strokeWidth={1.5} />}
                iconColor="text-blue-500"
                title={t('features.why_truescope.reason1_title')}
                description={t('features.why_truescope.reason1_desc')}
                variants={itemVariants}
              />
              <IconItem
                icon={<TrendingUp size={24} strokeWidth={1.5} />}
                iconColor="text-purple-500"
                title={t('features.why_truescope.reason2_title')}
                description={t('features.why_truescope.reason2_desc')}
                variants={itemVariants}
              />
              <IconItem
                icon={<Users size={24} strokeWidth={1.5} />}
                iconColor="text-green-500"
                title={t('features.why_truescope.reason3_title')}
                description={t('features.why_truescope.reason3_desc')}
                variants={itemVariants}
              />
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}

function BulletItem({ dotColor, title, description, variants }: { dotColor: string, title: string, description: string, variants: any }) {
  return (
    <motion.div variants={variants} className="flex gap-5 items-start">
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-[0_0_0_4px_rgba(37,99,235,0.08)] dark:shadow-[0_0_0_4px_rgba(255,255,255,0.05)]`} />
      </div>
      <div>
        <h3 className="text-[17px] font-bold text-content-main leading-tight mb-1 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-[15px] text-content-muted transition-colors duration-300 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function IconItem({ icon, iconColor, title, description, variants }: { icon: React.ReactNode, iconColor: string, title: string, description: string, variants: any }) {
  return (
    <motion.div variants={variants} className="flex gap-5 items-start">
      <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-[17px] font-bold text-content-main leading-tight mb-1 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-[15px] text-content-muted transition-colors duration-300 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
