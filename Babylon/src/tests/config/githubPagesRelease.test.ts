import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveConfig } from 'vite'

const babylonRoot = process.cwd()
const repositoryRoot = path.resolve(babylonRoot, '..')
const workflowPath = path.join(
  repositoryRoot,
  '.github',
  'workflows',
  'release-web-build-to-github-pages.yml'
)

describe('GitHub Pages release publishing', () => {
  it('builds Vite assets with paths relative to each release folder',
    async () => {
      const config = await resolveConfig(
        {
          configFile: path.join(babylonRoot, 'vite.config.ts')
        },
        'build'
      )

      expect(config.base).toBe('./')
    })

  it('uses the Vite base URL for runtime audio assets', () => {
    const source = readFileSync(
      path.join(babylonRoot, 'src', 'client', 'scripts', 'index.ts'),
      'utf8'
    )

    expect(source).toContain('import.meta.env.BASE_URL')
    expect(source).not.toContain("playSound('/assets/")
  })

  it('publishes a Babylon build when a GitHub release is published', () => {
    expect(existsSync(workflowPath)).toBe(true)

    if (!existsSync(workflowPath)) {
      return
    }

    const workflow = readFileSync(workflowPath, 'utf8')

    expect(workflow).toMatch(/release:\s*\n\s*types:\s*\n\s*- published/)
    expect(workflow).toContain('working-directory: Babylon')
    expect(workflow).toContain('npm ci')
    expect(workflow).toContain('npm run build')
    expect(workflow).toContain('actions/upload-pages-artifact@v3')
    expect(workflow).toContain('actions/deploy-pages@v4')
    expect(workflow).toContain('pages-store/releases/${release_version}')
  })

  it('documents the live demo and versioned releases', () => {
    const readme = readFileSync(
      path.join(repositoryRoot, 'README.md'),
      'utf8'
    )

    expect(readme).toContain('## Live Demo')
    expect(readme).toContain(
      'https://samuelasherrivello.github.io/' +
        'babylon-project-template/latest/'
    )
    expect(readme).toContain('/releases/<version>/')
  })
})
