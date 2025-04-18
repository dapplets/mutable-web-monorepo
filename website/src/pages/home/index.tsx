import styles from './Home.module.scss';
import { Layout } from '@/components/Layout';
import HeroSection from '@/components/HomePage/HeroSection';
import HowItWorksSection from '@/components/HomePage/HowItWorksSection';
import ExamplesSection from '@/components/HomePage/ExamplesSection';
import FeaturesSection from '@/components/HomePage/FeaturesSection';
import GetStartedSection from '@/components/HomePage/GetStartedSection';

const Home = () => {
  return (
    <Layout
      title='Mutable Web is a customization layer built on top of the existing web'
      description='Dapplets and the Mutable Web enable communities to create a custom version(Mutation) of an existing website by enhancing it with add-on applications. Dapplets run in the user s browser and allowing them to take control of UX/UI on any website'
    >
      <div className={styles.wrapper}>
        <HeroSection />
        <HowItWorksSection />
        <ExamplesSection />
        <FeaturesSection />
        <GetStartedSection />
      </div>
    </Layout>
  );
};

export default Home;
