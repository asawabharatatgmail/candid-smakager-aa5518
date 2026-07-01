/**
 * Smoke tests for UserRole enum — ensures values haven't drifted,
 * since backend JWT payloads depend on these exact strings.
 */
import { UserRole } from '../../types';

describe('UserRole enum', () => {
  it('has exactly 8 roles', () => {
    expect(Object.values(UserRole)).toHaveLength(8);
  });

  it('institute roles use expected strings', () => {
    expect(UserRole.ProductOwner).toBe('Product Owner');
    expect(UserRole.ClassAdmin).toBe('Class Admin');
    expect(UserRole.BranchAdmin).toBe('Branch Admin');
    expect(UserRole.Teacher).toBe('Teacher');
    expect(UserRole.Student).toBe('Student');
    expect(UserRole.Parent).toBe('Parent');
  });

  it('external roles are distinct from institute roles', () => {
    const external = [UserRole.ExternalParent, UserRole.ExternalStudent];
    const institute = [
      UserRole.ProductOwner, UserRole.ClassAdmin, UserRole.BranchAdmin,
      UserRole.Teacher, UserRole.Student, UserRole.Parent,
    ];
    external.forEach(r => expect(institute).not.toContain(r));
  });

  it('no two roles share the same string value', () => {
    const values = Object.values(UserRole);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});
