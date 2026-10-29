import { useMemo, useState } from 'react'
import { ArrowRight, Check, ChevronDown, Leaf, Minus, Plus, ShoppingBasket, Sparkles } from 'lucide-react'

const categories = [
  { id: 'legume', label: 'Legume și fructe', hint: 'Proaspete, de sezon', icon: '🥦', checked: true },
  { id: 'proteine', label: 'Carne, pește și ouă', hint: 'Surse de proteine', icon: '🥚', checked: true },
  { id: 'lactate', label: 'Lactate', hint: 'Lapte, iaurt, brânzeturi', icon: '🥛', checked: true },
  { id: 'baza', label: 'Produse de bază', hint: 'Orez, paste, făină, ulei', icon: '🌾', checked: true },
  { id: 'conserve', label: 'Conserve și congelate', hint: 'Pentru cămară și rezervă', icon: '🫘', checked: false },
  { id: 'gustari', label: 'Gustări și extra', hint: 'Opțional, dacă rămâne buget', icon: '🍎', checked: false },
]

export default function App() {
  const [budget, setBudget] = useState('500')
  const [people, setPeople] = useState(2)
  const [period, setPeriod] = useState('săptămână')
  const [priority, setPriority] = useState('balanced')
  const [selected, setSelected] = useState<string[]>(categories.filter(c => c.checked).map(c => c.id))
  const [submitted, setSubmitted] = useState(false)
  const amount = Math.max(0, Number(budget) || 0)
  const perPerson = useMemo(() => people > 0 ? amount / people : amount, [amount, people])

  function toggleCategory(id: string) {
    setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Beavy acasă">
          <span className="brand-mark"><Leaf size={21} strokeWidth={2.5} /></span>
          <span>beavy<span className="brand-dot">.</span></span>
        </a>
        <span className="topbar-note"><span className="status-dot" /> Planificare inteligentă</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> MAI MULT CONTROL, MAI PUȚIN RISIPIT</div>
          <h1>Cumpărături bune.<br /><span>Buget ținut în frâu.</span></h1>
          <p>Spune-ne ce buget ai. Beavy te va ajuta să-l transformi într-o listă de cumpărături alimentare realistă.</p>
          <div className="hero-proof"><span className="proof-icon"><Check size={14} /></span> Tu decizi ce intră în coș. Mereu.</div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-circle circle-one" />
          <div className="art-circle circle-two" />
          <div className="basket-emoji">🛒</div>
          <span className="floating-food food-one">🥑</span>
          <span className="floating-food food-two">🍅</span>
          <span className="floating-food food-three">🥖</span>
          <div className="art-label"><span className="art-label-dot" /> Bugetul tău, planul tău</div>
        </div>
      </section>

      <section className="planner">
        <div className="section-heading">
          <div>
            <span className="step-label">PASUL 01</span>
            <h2>Hai să-ți facem planul</h2>
            <p>Începem cu lucrurile esențiale. Poți modifica totul mai târziu.</p>
          </div>
          <div className="step-count">01 <span>/ 03</span></div>
        </div>

        <div className="planner-grid">
          <div className="form-column">
            <div className="field-card budget-card">
              <label className="field-label" htmlFor="budget">Ce buget ai la dispoziție?</label>
              <p className="field-hint">Suma totală pe care vrei s-o cheltuiești.</p>
              <div className="money-input-wrap">
                <input id="budget" type="number" min="0" step="10" value={budget} onChange={e => setBudget(e.target.value)} />
                <span>LEI</span>
              </div>
              <div className="budget-presets">
                {[300, 400, 500, 700].map(value => <button key={value} type="button" className={Number(budget) === value ? 'preset active' : 'preset'} onClick={() => setBudget(String(value))}>{value} lei</button>)}
              </div>
            </div>

            <div className="field-card">
              <div className="field-label">Pentru câte persoane?</div>
              <p className="field-hint">Câte persoane vor mânca din cumpărăturile acestea.</p>
              <div className="people-control">
                <div className="people-copy"><span className="people-number">{people}</span><span>{people === 1 ? 'persoană' : 'persoane'}</span></div>
                <div className="stepper">
                  <button type="button" aria-label="Scade numărul de persoane" disabled={people <= 1} onClick={() => setPeople(p => Math.max(1, p - 1))}><Minus size={16} /></button>
                  <button type="button" aria-label="Crește numărul de persoane" disabled={people >= 12} onClick={() => setPeople(p => Math.min(12, p + 1))}><Plus size={16} /></button>
                </div>
              </div>
              <div className="per-person"><span>Buget / persoană</span><strong>{perPerson.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei</strong></div>
            </div>

            <div className="field-card">
              <label className="field-label" htmlFor="period">Pentru ce perioadă?</label>
              <p className="field-hint">Planificăm în funcție de ritmul tău.</p>
              <div className="select-wrap">
                <select id="period" value={period} onChange={e => setPeriod(e.target.value)}>
                  <option value="3 zile">3 zile</option>
                  <option value="săptămână">O săptămână</option>
                  <option value="2 săptămâni">2 săptămâni</option>
                  <option value="lună">O lună</option>
                </select>
                <ChevronDown size={17} />
              </div>
            </div>
          </div>

          <div className="form-column">
            <div className="field-card category-card">
              <div className="field-label">Ce vrei să includem?</div>
              <p className="field-hint">Alege categoriile de care ai nevoie.</p>
              <div className="category-list">
                {categories.map(category => {
                  const checked = selected.includes(category.id)
                  return <button type="button" key={category.id} className={checked ? 'category-row selected' : 'category-row'} onClick={() => toggleCategory(category.id)} aria-pressed={checked}>
                    <span className="category-emoji">{category.icon}</span>
                    <span className="category-text"><strong>{category.label}</strong><small>{category.hint}</small></span>
                    <span className={checked ? 'check-box checked' : 'check-box'}>{checked && <Check size={14} />}</span>
                  </button>
                })}
              </div>
            </div>
            <div className="field-card priority-card">
              <div className="field-label">Ce contează cel mai mult?</div>
              <p className="field-hint">Alegem un punct de pornire. Îl poți schimba oricând.</p>
              <div className="priority-options">
                <button type="button" className={priority === 'price' ? 'priority-option active' : 'priority-option'} onClick={() => setPriority('price')}><span>💰</span><strong>Cel mai mic preț</strong><small>Economisim cât mai mult.</small></button>
                <button type="button" className={priority === 'balanced' ? 'priority-option active' : 'priority-option'} onClick={() => setPriority('balanced')}><span>⚖️</span><strong>Echilibru</strong><small>Preț bun, efort rezonabil.</small></button>
                <button type="button" className={priority === 'effort' ? 'priority-option active' : 'priority-option'} onClick={() => setPriority('effort')}><span>⏱️</span><strong>Mai puțin efort</strong><small>Cumpărături cât mai simple.</small></button>
              </div>
            </div>
          </div>
        </div>

        <div className="submit-area">
          <div className="privacy-note"><span className="privacy-icon"><ShoppingBasket size={17} /></span><span><strong>Fără surprize la casă.</strong><small>Vom separa prețurile verificate de estimări.</small></span></div>
          <button type="button" className="primary-button" onClick={() => setSubmitted(true)} disabled={amount <= 0 || selected.length === 0}>Construiește planul <ArrowRight size={18} /></button>
        </div>
        {submitted && <div className="result-panel" role="status">
          <div className="result-icon"><Check size={19} /></div>
          <div><strong>Preferințele tale sunt pregătite.</strong><p>Buget de {amount.toLocaleString('ro-RO')} lei pentru {people} {people === 1 ? 'persoană' : 'persoane'}, pe {period}. {selected.length} categorii selectate. Prioritate: {priority === 'price' ? 'cel mai mic preț' : priority === 'effort' ? 'mai puțin efort' : 'echilibru între preț și efort'}.</p><small>Următorul pas va fi catalogul de produse și calculul real al coșului. Acesta este momentan un prototip, nu o comparație de prețuri live.</small></div>
        </div>}
      </section>

      <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-mark"><Leaf size={17} /></span><span>beavy<span className="brand-dot">.</span></span></a><span>Cumpărături chibzuite. Fără risipă.</span><span className="footer-version">PROTOTIP · 0.1</span></footer>
    </main>
  )
}