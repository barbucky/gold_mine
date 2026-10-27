// Séparé de scene.ts (qui importe Three.js) pour pouvoir tester la disponibilité du WebGL
// sans charger la librairie 3D — seule cette fonction doit rester légère et statique.
export function estWebglDisponible(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
