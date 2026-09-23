import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { SubjectId, Course } from '../../../../data/courses';
import { CoursesApiService } from '../../../../shared/courses-api.service';
// import { CoursesApiService } from '../../../../services/courses-api.service';

type LevelFilter =
  | 'tous'
  | 'debutant'
  | 'intermediaire'
  | 'avance'
  | 'populaires';

@Component({
  selector: 'app-mes-cours',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mes-cours.html',
  styleUrl: './mes-cours.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesCours {

  private readonly route = inject(ActivatedRoute);
  private readonly coursesApi = inject(CoursesApiService);

  /**
   * Sujet actuellement sélectionné
   */
  readonly subjectId = toSignal(
    this.route.paramMap.pipe(
      map(
        p =>
          (p.get('subjectId') ?? 'affaires') as SubjectId
      )
    ),
    {
      initialValue: 'affaires' as SubjectId
    }
  );

  /**
   * Filtre actuellement sélectionné
   */
  readonly activeFilter = signal<LevelFilter>('tous');

  /**
   * Tous les cours récupérés depuis Laravel
   */
  readonly courses = toSignal(
    this.coursesApi.getCourses(),
    {
      initialValue: [] as Course[]
    }
  );

  /**
   * Libellés des matières
   */
  readonly subjectLabels: Record<SubjectId, string> = {

    affaires: 'Affaires et gestion',

    comptabilite: 'Comptabilité et finance',

    psychologie: 'Psychologie',

    sante: 'Soins de santé',

    donnees: 'Analyse de données',

    informatique: 'Informatique et technologie',

    droit: 'Droit',

    direction: 'Direction et leadership',

    marketing: 'Marketing',

    enseignement: 'Enseignement et pédagogie',

    langues: 'Langues',

    rh: 'Ressources humaines',

    audit: 'Audit et contrôle de gestion',

    communication: 'Communication',

    entrepreneuriat: 'Entrepreneuriat',

    'developpement-durable': 'Développement durable',

    ingenierie: 'Ingénierie',

    design: 'Design et créativité',
  };

  /**
   * Filtres disponibles
   */
  readonly filters: {
    id: LevelFilter;
    label: string;
  }[] = [

    {
      id: 'tous',
      label: 'Tous'
    },

    {
      id: 'populaires',
      label: 'Les plus populaires'
    },

    {
      id: 'debutant',
      label: 'Débutant'
    },

    {
      id: 'intermediaire',
      label: 'Intermédiaire'
    },

    {
      id: 'avance',
      label: 'Avancé'
    },

  ];

  /**
   * Cours filtrés
   */
  readonly filteredCourses = computed(() => {

    const subject = this.subjectId();

    const filter = this.activeFilter();

    let list = this.courses().filter(
      course => course.subject === subject
    );

    /**
     * Filtre populaire
     */
    if (filter === 'populaires') {

      list = list.filter(
        course => course.popular
      );

    }

    /**
     * Filtre niveau
     */
    else if (filter !== 'tous') {

      list = list.filter(
        course => course.level === filter
      );

    }

    return list;
  });

  /**
   * Nom de la matière actuelle
   */
  readonly currentSubjectLabel = computed(
    () => this.subjectLabels[this.subjectId()]
  );

  /**
   * Modifier le filtre
   */
  setFilter(filter: LevelFilter): void {

    this.activeFilter.set(filter);

  }
}
