import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionTitle } from '../../../../shared/section-title/section-title';

type ProgramTone =
  | 'gold'
  | 'purple'
  | 'blue'
  | 'cyan'
  | 'orange'
  | 'green'
  | 'pink'
  | 'navy';

interface Program {
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly route: string;
  /** Chemin relatif depuis le dossier public/. */
  readonly image: string;
  readonly tone: ProgramTone;
  readonly highlighted?: boolean;
}

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [RouterLink, SectionTitle],
  templateUrl: './programs.html',
  styleUrl: './programs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Programs {
  readonly programs: readonly Program[] = [
    {
      number: '01',
      title: 'Contrôle de gestion',
      description:
        'Nous concevons des outils de pilotage adaptés à votre structure : tableaux de bord, indicateurs clés et analyses pour transformer vos données en leviers de décision.',
      route: '/formations/controle-de-gestion',
      image: 'images/nos_savoir_faires/controlle_de_gestion.png',
      tone: 'gold',
    },
    {
      number: '02',
      title: 'Gestion des risques',
      description:
        'Nous vous aidons à identifier, mesurer et maîtriser les risques financiers et opérationnels qui peuvent affecter la stabilité et la croissance de votre organisation.',
      route: '/formations/gestion-des-risques',
      image: 'images/nos_savoir_faires/gestion_des_risques.png',
      tone: 'purple',
    },
    {
      number: '03',
      title: 'Fiscalité & juridique',
      description:
        'Nous sécurisons vos obligations fiscales et juridiques grâce à une approche préventive, des conseils pratiques et des solutions adaptées à votre activité.',
      route: '/formations/fiscalite-juridique',
      image: 'images/nos_savoir_faires/fiscalite_et_juridique.png',
      tone: 'blue',
    },
    {
      number: '04',
      title: 'Stratégie & organisation',
      description:
        'Nous co-construisons des feuilles de route réalistes pour aligner votre vision, vos ressources et vos priorités avec les évolutions de votre marché.',
      route: '/formations/strategie-organisation',
      image: 'images/nos_savoir_faires/strategie_et_organisation.png',
      tone: 'cyan',
      highlighted: true,
    },
    {
      number: '05',
      title: 'Ressources humaines',
      description:
        'Nous plaçons le capital humain au centre de la performance grâce à des solutions de gestion, de développement des compétences et d’organisation du travail.',
      route: '/formations/ressources-humaines',
      image: 'images/nos_savoir_faires/ressources_humaines.png',
      tone: 'orange',
    },
    {
      number: '06',
      title: 'Audit interne externalisé',
      description:
        'Nous apportons une évaluation indépendante de vos processus afin de révéler vos forces, corriger vos faiblesses et améliorer durablement votre organisation.',
      route: '/formations/audit-interne',
      image: 'images/nos_savoir_faires/audit_externe.png',
      tone: 'green',
    },
    {
      number: '07',
      title: 'KMAA IT',
      description:
        'Nous développons des solutions numériques adaptées à vos besoins pour automatiser vos opérations, améliorer votre productivité et renforcer votre compétitivité.',
      route: '/formations/kmaa-it',
      image: 'images/nos_savoir_faires/it.png',
      tone: 'pink',
      highlighted: true,
    },
    {
      number: '08',
      title: 'Formation',
      description:
        'Nous proposons des formations pratiques pour développer les compétences des professionnels et des particuliers selon leurs objectifs et leur niveau.',
      route: '/formations/catalogue',
      image: 'images/nos_savoir_faires/formations.png',
      tone: 'navy',
    },
  ];
}
