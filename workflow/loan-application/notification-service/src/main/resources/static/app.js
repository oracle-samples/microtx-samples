const refreshButton = document.querySelector('#refresh-button');
const statusElement = document.querySelector('#status');
const messagesBody = document.querySelector('#messages-body');
const messageCount = document.querySelector('#message-count');
const queueDetails = document.querySelector('#queue-details');
const txEventQueueApi = 'api/txeventq';

function setStatus(message, type = '') {
  statusElement.className = `status ${type}`;
  statusElement.textContent = message;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatPayload(payload) {
  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch (_) {
    return payload || '';
  }
}

function formatTimestamp(value) {
  return value ? new Date(value).toLocaleString() : 'Unknown';
}

function renderQueueDetails(metadata) {
  const queueLabel = document.createElement('strong');
  queueLabel.textContent = 'Queue:';
  const consumerLabel = document.createElement('strong');
  consumerLabel.textContent = 'Consumer:';

  queueDetails.replaceChildren(
    queueLabel,
    ` ${metadata.queueName} · `,
    consumerLabel,
    ` ${metadata.consumerName}`,
  );
}

function renderMessages(messages) {
  messageCount.textContent = `${messages.length} message${messages.length === 1 ? '' : 's'}`;
  if (messages.length === 0) {
    messagesBody.innerHTML = '<tr><td class="empty" colspan="4">No pending messages for the configured consumer.</td></tr>';
    return;
  }

  messagesBody.innerHTML = messages.map((message) => `
    <tr>
      <td>${escapeHtml(formatTimestamp(message.enqueuedAt))}</td>
      <td class="message-id">${escapeHtml(message.messageId)}</td>
      <td>
        <details>
          <summary>View JSON payload</summary>
          <p class="payload-label">Formatted JSON</p>
          <pre>${escapeHtml(formatPayload(message.payload))}</pre>
        </details>
      </td>
      <td><button type="button" class="consume-button" data-message-id="${escapeHtml(message.messageId)}">Consume</button></td>
    </tr>
  `).join('');

  document.querySelectorAll('.consume-button').forEach((button) => {
    button.addEventListener('click', () => consumeMessage(button));
  });
}

async function responseError(response) {
  try {
    const body = await response.json();
    return body.message || `Request failed (${response.status})`;
  } catch (_) {
    return `Request failed (${response.status})`;
  }
}

async function loadMessages() {
  refreshButton.disabled = true;
  setStatus('Loading configured queue…');
  try {
    const metadataResponse = await fetch(`${txEventQueueApi}/metadata`);
    if (!metadataResponse.ok) {
      const message = await responseError(metadataResponse);
      const type = metadataResponse.status === 503 ? 'disabled' : 'error';
      setStatus(message, type);
      if (metadataResponse.status === 503) {
        refreshButton.disabled = true;
      }
      return;
    }
    const metadata = await metadataResponse.json();
    renderQueueDetails(metadata);

    setStatus('Loading pending messages…');
    const response = await fetch(`${txEventQueueApi}/messages`);
    if (!response.ok) {
      const message = await responseError(response);
      const type = response.status === 503 ? 'disabled' : 'error';
      setStatus(message, type);
      if (response.status === 503) {
        refreshButton.disabled = true;
      }
      return;
    }
    const messages = await response.json();
    renderMessages(messages);
    setStatus(`Loaded ${messages.length} pending message${messages.length === 1 ? '' : 's'}.`, 'success');
  } catch (_) {
    setStatus('Unable to reach the notification service.', 'error');
  } finally {
    if (!statusElement.classList.contains('disabled')) {
      refreshButton.disabled = false;
    }
  }
}

async function consumeMessage(button) {
  const messageId = button.dataset.messageId;
  if (!window.confirm(`Consume message ${messageId}? This cannot be undone.`)) {
    return;
  }

  button.disabled = true;
  setStatus('Consuming message…');
  try {
    const response = await fetch(`${txEventQueueApi}/messages/${encodeURIComponent(messageId)}/consume`, { method: 'POST' });
    if (!response.ok) {
      setStatus(await responseError(response), 'error');
      return;
    }
    setStatus('Message consumed. Refreshing the list…', 'success');
    await loadMessages();
  } catch (_) {
    setStatus('Unable to reach the notification service.', 'error');
  } finally {
    if (!statusElement.classList.contains('disabled')) {
      button.disabled = false;
    }
  }
}

refreshButton.addEventListener('click', loadMessages);
loadMessages();
