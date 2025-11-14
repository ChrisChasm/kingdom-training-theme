import PageHeader from '@/components/PageHeader';

export default function AboutPage() {
  return (
    <>
      <PageHeader 
        title="About Kingdom.Training"
        description="Training disciple makers to use media strategically for Disciple Making Movements"
      />

      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          {/* Our Vision */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
            <div className="prose prose-lg max-w-none">
              <p>
                Kingdom.Training focuses on practical training for Media to Disciple Making Movements (M2DMM). 
                We are field workers with a heart for the unreached and least-reached peoples of the world, 
                and our passion is to equip disciple makers with strategic media tools that bridge online 
                engagement with face-to-face discipleship.
              </p>
              <p>
                We operate within what we call the &ldquo;Heavenly Economy&rdquo;—a principle that challenges 
                the broken world&apos;s teaching that &ldquo;the more you get, the more you should keep.&rdquo; 
                Instead, we reflect God&apos;s generous nature by offering free training, hands-on coaching, 
                and open-source tools.
              </p>
            </div>
          </section>

          {/* Our Mission */}
          <section className="mb-16 bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <div className="prose prose-lg max-w-none">
              <p>
                Like the men of Issachar who understood the times, we equip disciple makers to use media 
                strategically—identifying spiritual seekers online and connecting them with face-to-face 
                disciplers who help them discover, obey, and share all that Jesus taught.
              </p>
              <p className="text-primary-700 font-semibold">
                We wonder what the Church could accomplish with technology God has given to this 
                generation for the first time in history.
              </p>
            </div>
          </section>

          {/* How We Work */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How Media to Disciple Making Movements Works</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  1. Media Content
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Targeted content reaches entire people groups through platforms like Facebook and Google Ads. 
                  This is the wide end of the funnel, introducing masses of people to the gospel message.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  2. Digital Filtering
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Trained responders dialogue with seekers online, identifying persons of peace ready for 
                  face-to-face engagement. This filters out disinterested individuals and focuses on 
                  genuine seekers.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  3. Face-to-Face Discipleship
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Multipliers meet seekers in person, guiding them through discovery, obedience, and sharing 
                  in reproducing communities. This is where true disciple making happens.
                </p>
              </div>
            </div>
          </section>

          {/* Our Foundation */}
          <section className="bg-primary-900 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-6">Our Foundation</h2>
            
            <blockquote className="mb-6 pl-4 border-l-4 border-secondary-400">
              <p className="text-lg italic leading-relaxed mb-2">
                &ldquo;Of the sons of Issachar, men who understood the times, with knowledge of what 
                Israel should do.&rdquo;
              </p>
              <footer className="text-sm text-blue-200">— 1 Chronicles 12:32</footer>
            </blockquote>

            <blockquote className="pl-4 border-l-4 border-secondary-400">
              <p className="text-lg italic leading-relaxed mb-2">
                &ldquo;Go and make disciples of all nations, baptizing them in the name of the Father 
                and of the Son and of the Holy Spirit, and teaching them to obey everything I have 
                commanded you. And surely I am with you always, to the very end of the age.&rdquo;
              </p>
              <footer className="text-sm text-blue-200">— Matthew 28:19-20</footer>
            </blockquote>
          </section>
        </div>
      </div>
    </>
  );
}

