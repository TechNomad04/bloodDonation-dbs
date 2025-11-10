export default function FormInput({ label, error, ...props }) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <input {...props} className={`form-input ${error ? 'error' : ''}`} />
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}