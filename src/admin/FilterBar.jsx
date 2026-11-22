/** Filters for the reception guest list / message audience: search, response, meals, tag. */
export default function FilterBar({ value, onChange, rows, search = true }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const tags = [...new Set(rows.flatMap((r) => r.tags || []))].sort();
  return (
    <div className="adm-filters">
      {search && <input className="adm-input grow" placeholder="Search name, phone, email, code, table…" value={value.q || ''} onChange={set('q')} />}
      <select className="adm-input" value={value.status || ''} onChange={set('status')} aria-label="Response">
        <option value="">Any response</option>
        <option value="attending">Attending</option>
        <option value="declined">Declined</option>
        <option value="pending">No reply yet</option>
      </select>
      <select className="adm-input" value={value.food || ''} onChange={set('food')} aria-label="Meals">
        <option value="">Any meals</option>
        <option value="veg">Has vegetarian</option>
        <option value="nonveg">Has non-veg</option>
      </select>
      {tags.length > 0 && (
        <select className="adm-input" value={value.tag || ''} onChange={set('tag')} aria-label="Tag">
          <option value="">Any tag</option>
          {tags.map((t) => <option key={t} value={t}>#{t}</option>)}
        </select>
      )}
    </div>
  );
}
