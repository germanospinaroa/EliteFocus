export type PeopleErrorCode =
  | 'ZILIS_ID_ALREADY_EXISTS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'USER_ALREADY_EXISTS'
  | 'IDENTITY_CONFLICT'
  | 'INVALID_SPONSOR'
  | 'INVALID_ADVISOR'
  | 'INVALID_ZILIS_ID'
  | 'INVALID_EMAIL'
  | 'CREATE_PERSON_FAILED';

export type PeopleError = { code: PeopleErrorCode; message: string; field?: string; detail?: string };

export const peopleErrors = {
  zilis: { code: 'ZILIS_ID_ALREADY_EXISTS', message: 'Ese ID Zilis ya está registrado en Elite Focus.', field: 'zilisId', detail: 'Revisa el número o busca a la persona antes de crear un nuevo acceso.' },
  email: { code: 'EMAIL_ALREADY_EXISTS', message: 'Ese correo ya está asociado a una cuenta de Elite Focus.', field: 'email', detail: 'Revisa si la persona ya tiene acceso o utiliza otro correo.' },
  identity: { code: 'IDENTITY_CONFLICT', message: 'Los datos ingresados corresponden a cuentas diferentes.', detail: 'Revisa el ID Zilis y el correo antes de continuar.' },
  sponsor: { code: 'INVALID_SPONSOR', message: 'No pudimos asignar el patrocinador.' },
  advisor: { code: 'INVALID_ADVISOR', message: 'No pudimos asignar el asesor.' },
  invalidZilis: { code: 'INVALID_ZILIS_ID', message: 'Introduce un ID Zilis válido.', field: 'zilisId' },
  invalidEmail: { code: 'INVALID_EMAIL', message: 'Introduce un correo válido.', field: 'email' },
  failed: { code: 'CREATE_PERSON_FAILED', message: 'No pudimos crear el acceso en este momento. Intenta nuevamente.' },
  user: { code: 'USER_ALREADY_EXISTS', message: 'Esta persona ya tiene una cuenta en Elite Focus.' },
} satisfies Record<string, PeopleError>;
