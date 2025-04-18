import styles from './PrivacyPolice.module.scss';
import { Layout } from '@/components/Layout';

function PrivacyPolicy() {
  return (
    <Layout
      title='Privacy Policy'
      description='This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service.'
    >
      <div className={styles.container}>
        <h1 className={styles.mainTitle}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>
          Last updated: {new Date().getFullYear()}
        </p>

        <div className={styles.content}>
          <p className={styles.paragraph}>
            This Privacy Policy describes Our policies and procedures on the
            collection, use, and disclosure of Your information when You use the
            Service and tells You about Your privacy rights and how the law
            protects You. We use Your Personal data to provide and improve the
            Service. By using the Service, You agree to the collection and use
            of information in accordance with this Privacy Policy.
          </p>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Interpretation and Definitions
            </h2>

            <h3 className={styles.subsectionTitle}>Interpretation</h3>
            <p className={styles.paragraph}>
              The words of which the initial letter is capitalized have meanings
              defined under the following conditions. The following definitions
              shall have the same meaning regardless of whether they appear in
              singular or plural.
            </p>

            <h3 className={styles.subsectionTitle}>Definitions</h3>
            <p className={styles.paragraph}>
              For the purposes of this Privacy Policy:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>Account</strong> means a unique account created for You
                to access our Service.
              </li>
              <li>
                <strong>Company</strong> refers to Crystal Reality Media GmbH,
                Marienthaler Str. 173.
              </li>
              <li>
                <strong>Cookies</strong> are small files placed on Your device
                by a website.
              </li>
              <li>
                <strong>Country</strong> refers to Hamburg, Germany.
              </li>
              <li>
                <strong>Device</strong> means any device that can access the
                Service.
              </li>
              <li>
                <strong>Personal Data</strong> is any information relating to an
                identified individual.
              </li>
              <li>
                <strong>Service</strong> refers to the Website.
              </li>
              <li>
                <strong>Service Provider</strong> means any person who processes
                data on our behalf.
              </li>
              <li>
                <strong>Usage Data</strong> refers to data collected
                automatically from Service use.
              </li>
              <li>
                <strong>Website</strong> refers to Dapplets Project, accessible
                from{' '}
                <a href='https://dapplets.org' className={styles.link}>
                  https://dapplets.org
                </a>
              </li>
              <li>
                <strong>You</strong> means the individual accessing or using the
                Service.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Collecting and Using Your Personal Data
            </h2>

            <h3 className={styles.subsectionTitle}>Types of Data Collected</h3>

            <h4 className={styles.subheading}>Personal Data</h4>
            <p className={styles.paragraph}>
              While using Our Service, We may ask You to provide personally
              identifiable information that can be used to contact or identify
              You, including:
            </p>
            <ul className={styles.list}>
              <li>Email address</li>
              <li>Usage Data</li>
            </ul>

            <h4 className={styles.subheading}>Usage Data</h4>
            <p className={styles.paragraph}>
              Usage Data is collected automatically and may include information
              such as Your Device&apos;s IP address, browser type, pages
              visited, time spent on pages, and other diagnostic data.
            </p>

            <h3 className={styles.subsectionTitle}>
              Tracking Technologies and Cookies
            </h3>
            <p className={styles.paragraph}>
              We use Cookies and similar tracking technologies to track activity
              and improve our Service.
            </p>

            <h4 className={styles.subheading}>Types of Cookies We Use</h4>
            <ul className={styles.list}>
              <li>
                <strong>Necessary Cookies:</strong> Essential to provide
                services.
              </li>
              <li>
                <strong>Acceptance Cookies:</strong> Identify cookie acceptance.
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Remember Your choices.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Use of Your Personal Data</h2>
            <p className={styles.paragraph}>
              The Company may use Personal Data for purposes including:
            </p>
            <ul className={styles.list}>
              <li>To provide and maintain our Service</li>
              <li>To manage Your Account</li>
              <li>To perform contracts</li>
              <li>To contact You</li>
              <li>To provide news and offers</li>
              <li>To manage Your requests</li>
              <li>For business transfers</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Sharing Your Personal Information
            </h2>
            <p className={styles.paragraph}>
              We may share Your information in situations including:
            </p>
            <ul className={styles.list}>
              <li>With Service Providers</li>
              <li>For business transfers</li>
              <li>With Affiliates</li>
              <li>With business partners</li>
              <li>With other users</li>
              <li>With Your consent</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Retention of Your Personal Data
            </h2>
            <p className={styles.paragraph}>
              We retain Your Data only as long as necessary for our purposes and
              to comply with legal obligations.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Security of Your Personal Data
            </h2>
            <p className={styles.paragraph}>
              We take reasonable security measures, but no Internet transmission
              is 100% secure.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Children&apos;s Privacy</h2>
            <p className={styles.paragraph}>
              Our Service does not address anyone under 13. We do not knowingly
              collect information from children under 13 without parental
              consent.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Links to Other Websites</h2>
            <p className={styles.paragraph}>
              Our Service may contain links to external sites not operated by
              Us. We have no control over their content or privacy practices.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
            <p className={styles.paragraph}>
              If you have questions about this Privacy Policy:
            </p>
            <ul className={styles.list}>
              <li>
                By email:{' '}
                <a href='mailto:contact@dapplets.org' className={styles.link}>
                  contact@dapplets.org
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default PrivacyPolicy;
