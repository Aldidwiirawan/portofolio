const GITHUB_REPO = /^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+/

/** The first public github.com code link of a project (private links have no address on the page). */
export function publicRepoLink(project) {
  return project.links.find((link) => link.type === 'code' && !link.is_private && GITHUB_REPO.test(link.url || '')) ?? null
}
