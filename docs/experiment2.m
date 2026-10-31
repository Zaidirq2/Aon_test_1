%% Experiment 2: Digital Modulation Techniques
clc; clear; close all;
rng(1);                              % Same results every run

N    = 120000;                       % Divisible by 1, 2 and 4 bits/symbol
data = randi([0 1], N, 1);           % Random binary data

schemes = {'BPSK', 'QPSK', '16-QAM'};
M_list  = [2 4 16];
tx      = cell(1, 3);

%% Parts 1-3: Modulation order, bits/symbol, ideal constellations
figure('Name', 'Ideal Constellations');
for s = 1:3
    M = M_list(s);
    k = log2(M);                     % Bits per symbol
    tx{s} = modulateBits(data, M);

    fprintf('%-7s: M = %2d,  k = log2(M) = %d bits/symbol,  symbols sent = %d\n', ...
            schemes{s}, M, k, N/k);

    % Ideal points with their bit labels
    labels = dec2bin(0:M-1, k);
    ideal  = modulateBits(reshape((labels - '0').', [], 1), M);

    subplot(1, 3, s);
    plot(real(ideal), imag(ideal), 'bo', 'MarkerFaceColor', 'b'); hold on;
    text(real(ideal) + 0.05, imag(ideal) + 0.12, cellstr(labels), 'Color', 'r', 'FontSize', 8);
    grid on; axis equal; axis([-1.5 1.5 -1.5 1.5]);
    xlabel('In-phase (I)'); ylabel('Quadrature (Q)');
    title(sprintf('%s (M = %d, k = %d)', schemes{s}, M, k));
end

%% Part 4: BER vs SNR for all three schemes
SNR_dB = 0:1:20;
BER    = zeros(3, length(SNR_dB));
BER_th = zeros(3, length(SNR_dB));

for s = 1:3
    M = M_list(s);
    k = log2(M);
    for i = 1:length(SNR_dB)
        rxSig  = awgn(tx{s}, SNR_dB(i), 'measured');   % AWGN channel
        rxData = demodulateBits(rxSig, M);             % Demodulate
        [~, BER(s, i)] = biterr(data, rxData);         % Compare & compute BER
    end
    % Theoretical BER (awgn SNR is per symbol, so Eb/N0 = SNR - 10log10(k))
    EbNo = SNR_dB - 10*log10(k);
    if M == 16
        BER_th(s, :) = berawgn(EbNo, 'qam', M);
    else
        BER_th(s, :) = berawgn(EbNo, 'psk', M, 'nondiff');
    end
end

figure('Name', 'BER vs SNR');
colors = {'b', 'g', 'r'};
for s = 1:3
    semilogy(SNR_dB, BER(s, :), [colors{s} 'o-'], 'LineWidth', 1.5); hold on;
    semilogy(SNR_dB, BER_th(s, :), [colors{s} '--'], 'LineWidth', 1);
end
grid on; ylim([1e-6 1]);
xlabel('SNR (dB)'); ylabel('BER');
title('BER vs SNR: BPSK, QPSK, 16-QAM over AWGN');
legend('BPSK sim', 'BPSK theory', 'QPSK sim', 'QPSK theory', ...
       '16-QAM sim', '16-QAM theory', 'Location', 'southwest');

% Comparison at the same SNR
SNR_cmp = 10;
idx = find(SNR_dB == SNR_cmp);
fprintf('\nBER at SNR = %d dB:\n', SNR_cmp);
for s = 1:3
    fprintf('  %-7s: %g\n', schemes{s}, BER(s, idx));
end

%% Part 5: Received constellations at low and high SNR
SNR_low  = 5;
SNR_high = 20;
nPlot    = 3000;

figure('Name', 'Received Constellations');
for s = 1:3
    M  = M_list(s);
    rL = awgn(tx{s}, SNR_low,  'measured');
    rH = awgn(tx{s}, SNR_high, 'measured');
    nP = min(nPlot, length(tx{s}));

    subplot(2, 3, s);
    plot(real(rL(1:nP)), imag(rL(1:nP)), 'b.', 'MarkerSize', 3); hold on;
    plot(real(tx{s}), imag(tx{s}), 'r*', 'MarkerSize', 8);
    grid on; axis equal; axis([-2 2 -2 2]);
    title(sprintf('%s, SNR = %d dB', schemes{s}, SNR_low));
    xlabel('I'); ylabel('Q');

    subplot(2, 3, s + 3);
    plot(real(rH(1:nP)), imag(rH(1:nP)), 'b.', 'MarkerSize', 3); hold on;
    plot(real(tx{s}), imag(tx{s}), 'r*', 'MarkerSize', 8);
    grid on; axis equal; axis([-2 2 -2 2]);
    title(sprintf('%s, SNR = %d dB', schemes{s}, SNR_high));
    xlabel('I'); ylabel('Q');
end

%% Part 6: Modulation order vs data rate (fixed symbol rate)
Rs = 1e6;                            % Symbol rate: 1 Msymbol/s (assumed)
k_list = log2(M_list);
Rb = Rs .* k_list;                   % Rb = Rs * log2(M)

T = table(schemes', M_list', k_list', Rb'/1e6, ...
    'VariableNames', {'Scheme', 'M', 'BitsPerSymbol', 'BitRate_Mbps'});
fprintf('\nData rate at Rs = %g Msymbol/s:\n', Rs/1e6);
disp(T);

figure('Name', 'Data Rate');
bar(Rb/1e6);
set(gca, 'XTickLabel', schemes);
ylabel('Bit rate (Mbps)');
title(sprintf('Data Rate vs Modulation Order (Rs = %g Msym/s)', Rs/1e6));
grid on;

%% ---------- Helper functions (must stay at the end of the file) ----------
function y = modulateBits(b, M)
    if M == 16
        y = qammod(b, M, 'InputType', 'bit', 'UnitAveragePower', true);
    else
        y = pskmod(b, M, (M == 4)*pi/4, 'gray', 'InputType', 'bit');
    end
end

function b = demodulateBits(y, M)
    if M == 16
        b = qamdemod(y, M, 'OutputType', 'bit', 'UnitAveragePower', true);
    else
        b = pskdemod(y, M, (M == 4)*pi/4, 'gray', 'OutputType', 'bit');
    end
end
