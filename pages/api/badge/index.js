import handler from './[id]';

export default async function indexHandler(req, res) {
  if (req.query.site) {
    req.query.id = req.query.site;
  } else {
    req.query.id = 'overall';
  }
  return handler(req, res);
}
