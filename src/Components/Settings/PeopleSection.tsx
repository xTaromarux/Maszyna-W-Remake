'use client';

import GitHubIcon from '@/Assets/Svg/GitHubIcon';
import LinkedInIcon from '@/Assets/Svg/LinkedInIcon';
import { useI18n } from '@/I18n/Index';
import type { PeopleSectionProps } from '@/Types/Components';

const PeopleSection = ({ title, people = [], showGithub = true, columns = 2 }: PeopleSectionProps) => {
  const { t } = useI18n();

  return (
    <section className="people-section" data-component="PeopleSection">
      <header className="creatorsHeader">
        <h1>{title}</h1>
      </header>
      <div className="creatorsContent">
        <div className="creatorsList" style={{ '--cols': columns }}>
          {people.map((person, index) => (
            <div key={`${person.name}-${index}`} className="creatorItem">
              <span className="creatorName">{person.name}</span>
              {!!person.roles?.length && (
                <div className="creatorRoles">
                  {person.roles.map((role, i) => (
                    <span key={i} className="creatorRole">
                      {role}
                    </span>
                  ))}
                </div>
              )}
              <div className="creatorLinks">
                {person.linkedin && (
                  <a
                    href={person.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="iconLink"
                    aria-label={t('common.social.linkedin')}
                    title={t('common.social.linkedin')}
                  >
                    <LinkedInIcon />
                  </a>
                )}
                {showGithub && person.github && (
                  <a
                    href={person.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="iconLink"
                    aria-label={t('common.social.github')}
                    title={t('common.social.github')}
                  >
                    <GitHubIcon />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PeopleSection;
