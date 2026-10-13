import UIKit

private let appGroup = "group.live.worldener.app"
private let keychainService = "live.worldener.app.auth"
private let keychainAccount = "token"
private let accessGroup = "S97YTUR98S.live.worldener.shared"
private let blue = UIColor(red: 0.184, green: 0.420, blue: 1, alpha: 1)
private let noteLimit = 150

@objc(ShareViewController)
final class ShareViewController: UIViewController, UITableViewDataSource, UITableViewDelegate, UITextViewDelegate {
  private let scroll = UIScrollView()
  private let content = UIStackView()
  private let previewImage = UIImageView()
  private let titleLabel = UILabel()
  private let hostLabel = UILabel()
  private let bodyLabel = UILabel()
  private let table = UITableView()
  private let noteView = UITextView()
  private let countLabel = UILabel()
  private let saveButton = UIButton(type: .system)
  private let statusLabel = UILabel()

  private var sharedURL: String?
  private var trips: [[String: Any]] = []
  private var selectedIndex = 0
  private var preview: [String: Any] = [:]
  private var tableHeight: NSLayoutConstraint?

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .systemBackground
    buildLayout()
    loadSharedURL()
  }

  private func buildLayout() {
    scroll.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(scroll)
    NSLayoutConstraint.activate([
      scroll.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
      scroll.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      scroll.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      scroll.bottomAnchor.constraint(equalTo: view.bottomAnchor),
    ])

    content.axis = .vertical
    content.spacing = 12
    content.translatesAutoresizingMaskIntoConstraints = false
    scroll.addSubview(content)
    NSLayoutConstraint.activate([
      content.topAnchor.constraint(equalTo: scroll.topAnchor, constant: 16),
      content.leadingAnchor.constraint(equalTo: scroll.leadingAnchor, constant: 16),
      content.trailingAnchor.constraint(equalTo: scroll.trailingAnchor, constant: -16),
      content.bottomAnchor.constraint(equalTo: scroll.bottomAnchor, constant: -24),
      content.widthAnchor.constraint(equalTo: scroll.widthAnchor, constant: -32),
    ])

    let header = UIStackView()
    header.axis = .horizontal
    header.alignment = .center
    let cancel = UIButton(type: .system)
    cancel.setTitle("Cancel", for: .normal)
    cancel.setTitleColor(blue, for: .normal)
    cancel.addTarget(self, action: #selector(cancel), for: .touchUpInside)
    let heading = UILabel()
    heading.text = "Save to Worldener"
    heading.font = .boldSystemFont(ofSize: 17)
    heading.textAlignment = .center
    header.addArrangedSubview(cancel)
    header.addArrangedSubview(heading)
    cancel.widthAnchor.constraint(equalToConstant: 70).isActive = true
    let spacer = UIView()
    spacer.widthAnchor.constraint(equalToConstant: 70).isActive = true
    header.addArrangedSubview(spacer)
    content.addArrangedSubview(header)

    previewImage.layer.cornerRadius = 16
    previewImage.clipsToBounds = true
    previewImage.contentMode = .scaleAspectFill
    previewImage.backgroundColor = UIColor(white: 0.93, alpha: 1)
    previewImage.heightAnchor.constraint(equalToConstant: 180).isActive = true
    content.addArrangedSubview(previewImage)

    titleLabel.font = .boldSystemFont(ofSize: 22)
    titleLabel.numberOfLines = 3
    hostLabel.font = .systemFont(ofSize: 14)
    hostLabel.textColor = .secondaryLabel
    bodyLabel.font = .systemFont(ofSize: 15)
    bodyLabel.numberOfLines = 4
    content.addArrangedSubview(titleLabel)
    content.addArrangedSubview(hostLabel)
    content.addArrangedSubview(bodyLabel)

    let section = UILabel()
    section.text = "Save to trip"
    section.font = .boldSystemFont(ofSize: 16)
    content.addArrangedSubview(section)

    table.dataSource = self
    table.delegate = self
    table.register(UITableViewCell.self, forCellReuseIdentifier: "trip")
    table.isScrollEnabled = false
    table.rowHeight = 72
    table.separatorStyle = .none
    tableHeight = table.heightAnchor.constraint(equalToConstant: 72)
    tableHeight?.isActive = true
    content.addArrangedSubview(table)

    let create = UIButton(type: .system)
    create.setTitle("+ Create a new trip", for: .normal)
    create.contentHorizontalAlignment = .left
    create.setTitleColor(.label, for: .normal)
    create.addTarget(self, action: #selector(createTrip), for: .touchUpInside)
    content.addArrangedSubview(create)

    let noteTitle = UILabel()
    noteTitle.text = "Add a note (optional)"
    noteTitle.font = .boldSystemFont(ofSize: 16)
    content.addArrangedSubview(noteTitle)

    noteView.font = .systemFont(ofSize: 16)
    noteView.layer.borderColor = UIColor.separator.cgColor
    noteView.layer.borderWidth = 1
    noteView.layer.cornerRadius = 12
    noteView.text = "e.g. We should definitely do this!"
    noteView.textColor = .placeholderText
    noteView.delegate = self
    noteView.heightAnchor.constraint(equalToConstant: 80).isActive = true
    content.addArrangedSubview(noteView)

    countLabel.font = .systemFont(ofSize: 12)
    countLabel.textColor = .secondaryLabel
    countLabel.textAlignment = .right
    countLabel.text = "0/\(noteLimit)"
    content.addArrangedSubview(countLabel)

    saveButton.setTitle("Save idea", for: .normal)
    saveButton.backgroundColor = blue
    saveButton.setTitleColor(.white, for: .normal)
    saveButton.layer.cornerRadius = 26
    saveButton.heightAnchor.constraint(equalToConstant: 52).isActive = true
    saveButton.addTarget(self, action: #selector(saveIdea), for: .touchUpInside)
    content.addArrangedSubview(saveButton)

    statusLabel.numberOfLines = 0
    statusLabel.textAlignment = .center
    statusLabel.textColor = .secondaryLabel
    statusLabel.isHidden = true
    content.addArrangedSubview(statusLabel)
  }

  private func loadSharedURL() {
    let items = extensionContext?.inputItems as? [NSExtensionItem] ?? []
    let providers = items.flatMap { $0.attachments ?? [] }
    if let provider = providers.first(where: { $0.hasItemConformingToTypeIdentifier("public.url") }) {
      provider.loadItem(forTypeIdentifier: "public.url", options: nil) { item, _ in
        let value = (item as? URL)?.absoluteString ?? (item as? NSURL)?.absoluteString
        DispatchQueue.main.async { self.receive(value) }
      }
      return
    }
    if let provider = providers.first(where: { $0.hasItemConformingToTypeIdentifier("public.plain-text") }) {
      provider.loadItem(forTypeIdentifier: "public.plain-text", options: nil) { item, _ in
        DispatchQueue.main.async { self.receive(item as? String) }
      }
      return
    }
    receive(nil)
  }

  private func receive(_ raw: String?) {
    sharedURL = extractHTTPS(raw)
    guard let sharedURL else {
      showMessage("No link found. Share an HTTPS link from Instagram, TikTok, Maps, or Safari.")
      saveButton.isEnabled = false
      return
    }
    titleLabel.text = sharedURL
    guard let token = readToken() else {
      showMessage("Sign in to Worldener to save this link.")
      saveButton.setTitle("Sign in", for: .normal)
      saveButton.removeTarget(self, action: #selector(saveIdea), for: .touchUpInside)
      saveButton.addTarget(self, action: #selector(signIn), for: .touchUpInside)
      return
    }
    fetchPreview(token: token, url: sharedURL)
    fetchTrips(token: token)
  }

  private func fetchPreview(token: String, url: String) {
    post(path: "/api/v1/user/saved-ideas/preview", token: token, body: ["url": url]) { [weak self] json in
      guard let self, let data = json?["data"] as? [String: Any] else { return }
      self.preview = data
      self.titleLabel.text = data["title"] as? String ?? url
      self.hostLabel.text = data["host"] as? String
      self.bodyLabel.text = data["description"] as? String
      if let image = data["image"] as? String {
        self.loadImage(image)
      }
    }
  }

  private func fetchTrips(token: String) {
    request(path: "/api/v1/user/getTrips", method: "GET", token: token, body: nil) { [weak self] json in
      guard let self else { return }
      let data = json?["data"] as? [String: Any]
      let trips = data?["trips"] as? [[String: Any]] ?? []
      self.trips = trips
      self.tableHeight?.constant = CGFloat(max(trips.count, 1)) * 72
      self.table.reloadData()
      if trips.isEmpty {
        self.showMessage("Create a trip in Worldener, then save this link.")
      }
    }
  }

  @objc private func saveIdea() {
    guard let url = sharedURL, trips.indices.contains(selectedIndex) else { return }
    guard let token = readToken() else {
      signIn()
      return
    }
    let trip = trips[selectedIndex]
    let tripId = stringValue(trip["_id"])
    saveButton.isEnabled = false
    post(path: "/api/v1/user/saved-ideas", token: token, body: [
      "url": url,
      "trip_id": tripId,
      "note": noteText(),
    ]) { [weak self] json in
      guard let self else { return }
      self.saveButton.isEnabled = true
      guard json?["success"] as? Bool == true else {
        self.showMessage((json?["message"] as? String) ?? "Could not save this link")
        return
      }
      let data = json?["data"] as? [String: Any]
      let name = (data?["trip_name"] as? String) ?? (trip["name"] as? String) ?? "your trip"
      let canonical = stringValue(data?["canonical_trip_id"]) 
      self.showSaved(name: name, tripId: canonical.isEmpty ? tripId : canonical)
    }
  }

  private func showSaved(name: String, tripId: String) {
    let alert = UIAlertController(
      title: "Saved to \(name)",
      message: "Your crew can now react to it in the Wishlist.",
      preferredStyle: .alert
    )
    alert.addAction(UIAlertAction(title: "View in Worldener", style: .default) { _ in
      self.openHost("live.worldener.app://trip/\(tripId)/wishlist", action: "wishlist", tripId: tripId)
    })
    alert.addAction(UIAlertAction(title: "Continue", style: .cancel) { _ in
      self.extensionContext?.completeRequest(returningItems: nil)
    })
    present(alert, animated: true)
  }

  @objc private func signIn() {
    guard let url = sharedURL else { return }
    let encoded = url.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? url
    openHost("live.worldener.app://save?url=\(encoded)", action: "save", tripId: nil)
  }

  @objc private func createTrip() {
    guard let url = sharedURL else { return }
    let encoded = url.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? url
    openHost("live.worldener.app://create-trip?url=\(encoded)", action: "createTrip", tripId: nil)
  }

  @objc private func cancel() {
    extensionContext?.cancelRequest(withError: NSError(domain: "worldener.share", code: 0))
  }

  private func openHost(_ raw: String, action: String, tripId: String?) {
    let defaults = UserDefaults(suiteName: appGroup)
    defaults?.set(sharedURL, forKey: "pendingShareUrl")
    defaults?.set(action, forKey: "pendingShareAction")
    if let tripId {
      defaults?.set(tripId, forKey: "pendingTripId")
    }
    guard let url = URL(string: raw) else { return }
    var responder: UIResponder? = self
    let selector = sel_registerName("openURL:")
    while let current = responder {
      if current.responds(to: selector) {
        current.perform(selector, with: url)
        break
      }
      responder = current.next
    }
    extensionContext?.completeRequest(returningItems: nil)
  }

  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    trips.count
  }

  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(withIdentifier: "trip", for: indexPath)
    let trip = trips[indexPath.row]
    var content = cell.defaultContentConfiguration()
    content.text = tripTitle(trip)
    let members = intValue(trip["memberCount"])
    let count = members > 0 ? members : 1
    content.secondaryText = "\(count) member\(count == 1 ? "" : "s")"
    cell.contentConfiguration = content
    cell.accessoryType = indexPath.row == selectedIndex ? .checkmark : .none
    cell.tintColor = blue
    return cell
  }

  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    selectedIndex = indexPath.row
    tableView.reloadData()
  }

  func textViewDidBeginEditing(_ textView: UITextView) {
    if textView.textColor == .placeholderText {
      textView.text = ""
      textView.textColor = .label
    }
  }

  func textViewDidChange(_ textView: UITextView) {
    if textView.text.count > noteLimit {
      textView.text = String(textView.text.prefix(noteLimit))
    }
    countLabel.text = "\(noteText().count)/\(noteLimit)"
  }

  private func noteText() -> String {
    noteView.textColor == .placeholderText ? "" : noteView.text
  }

  private func showMessage(_ text: String) {
    statusLabel.isHidden = false
    statusLabel.text = text
  }

  private func tripTitle(_ trip: [String: Any]) -> String {
    let name = (trip["name"] as? String) ?? (trip["destination"] as? String) ?? "Trip"
    guard let raw = trip["start_at"] as? String else { return name }
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let date = formatter.date(from: raw) ?? ISO8601DateFormatter().date(from: raw)
    guard let date else { return name }
    let display = DateFormatter()
    display.dateFormat = "MMM d"
    return "\(name) - \(display.string(from: date))"
  }

  private func loadImage(_ path: String) {
    let absolute: String
    if path.hasPrefix("http") {
      absolute = path
    } else {
      absolute = apiBase() + (path.hasPrefix("/") ? path : "/" + path)
    }
    guard let url = URL(string: absolute) else { return }
    URLSession.shared.dataTask(with: url) { data, _, _ in
      guard let data, let image = UIImage(data: data) else { return }
      DispatchQueue.main.async { self.previewImage.image = image }
    }.resume()
  }

  private func post(path: String, token: String, body: [String: String], completion: @escaping ([String: Any]?) -> Void) {
    request(path: path, method: "POST", token: token, body: body, completion: completion)
  }

  private func request(
    path: String,
    method: String,
    token: String,
    body: [String: String]?,
    completion: @escaping ([String: Any]?) -> Void
  ) {
    guard let url = URL(string: apiBase() + path) else {
      DispatchQueue.main.async { completion(nil) }
      return
    }
    var request = URLRequest(url: url)
    request.httpMethod = method
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    if let body {
      request.httpBody = try? JSONSerialization.data(withJSONObject: body)
    }
    URLSession.shared.dataTask(with: request) { data, _, _ in
      let json = data.flatMap { try? JSONSerialization.jsonObject(with: $0) as? [String: Any] }
      DispatchQueue.main.async { completion(json) }
    }.resume()
  }

  private func apiBase() -> String {
    let stored = UserDefaults(suiteName: appGroup)?.string(forKey: "apiBaseUrl")
    let base = (stored?.isEmpty == false ? stored! : "https://api.worldener.com")
    return base.hasSuffix("/") ? String(base.dropLast()) : base
  }

  private func readToken() -> String? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: keychainService,
      kSecAttrAccount as String: keychainAccount,
      kSecAttrAccessGroup as String: accessGroup,
      kSecReturnData as String: true,
      kSecMatchLimit as String: kSecMatchLimitOne,
    ]
    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    guard status == errSecSuccess, let data = item as? Data else { return nil }
    let token = String(data: data, encoding: .utf8)
    return token?.isEmpty == false ? token : nil
  }

  private func extractHTTPS(_ raw: String?) -> String? {
    guard let raw else { return nil }
    guard let match = raw.range(of: #"https://[^\s<>"']+"#, options: .regularExpression) else {
      return nil
    }
    return String(raw[match]).trimmingCharacters(in: CharacterSet(charactersIn: "),.;"))
  }

  private func stringValue(_ value: Any?) -> String {
    if let text = value as? String { return text }
    return ""
  }

  private func intValue(_ value: Any?) -> Int {
    if let number = value as? Int { return number }
    if let number = value as? NSNumber { return number.intValue }
    return 0
  }
}
