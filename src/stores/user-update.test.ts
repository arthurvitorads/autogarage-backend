import assert from 'node:assert/strict';
import test from 'node:test';
import { validateUpdateUser, validateUserId } from './user.store.js';
import { ApiError } from '../interfaces/error.js';

test('atualiza apenas nome e status, preservando false', () => {
  assert.deepEqual(validateUpdateUser({ an_nome: ' Ana ', bo_sts_reg: false }), {
    an_nome: 'Ana', bo_sts_reg: false,
  });
  for (const body of [null, [], {}, { an_nome: ' ', bo_sts_reg: true },
    { an_nome: 'Ana', bo_sts_reg: 'false' }, { an_nome: 'Ana' },
    ...['an_email', 'ca_senha', 'an_perfil', 'ca_id_firebase'].map(key => ({ an_nome: 'Ana', bo_sts_reg: true, [key]: 'alterado' }))]) {
    assert.throws(() => validateUpdateUser(body), ApiError);
  }
});

test('valida identificadores sem perder precisão de bigint', () => {
  assert.equal(validateUserId('9007199254740993'), 9007199254740993n);
  for (const id of ['0', '-1', '1.5', 'abc', '9223372036854775808', undefined]) {
    assert.throws(() => validateUserId(id), ApiError);
  }
});
