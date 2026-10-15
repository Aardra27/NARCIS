import importlib.util
from pathlib import Path


def load_report_generator_module():
    generator_path = Path(__file__).resolve().parents[1] / "llm" / "report_generator.py"
    spec = importlib.util.spec_from_file_location("narcis_llm_report_generator", generator_path)
    module = importlib.util.module_from_spec(spec)
    assert spec is not None
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_retryable_error_detection():
    module = load_report_generator_module()

    transient_error = type("TransientError", (Exception,), {"code": 503, "status": "UNAVAILABLE"})()
    invalid_key_error = type("InvalidKeyError", (Exception,), {"code": 400, "status": "INVALID_ARGUMENT"})()

    assert module._is_retryable_gemini_error(transient_error) is True
    assert module._is_retryable_gemini_error(invalid_key_error) is False
